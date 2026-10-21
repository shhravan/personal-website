"""Stress tests for scripts/substack_sync.py.

Run:  python3 -m unittest discover -s tests -v

Nothing here touches the network: `get` is replaced with a fake Substack that serves whatever
each test wants, including hostile or broken data. Each test builds a throwaway copy of the
blog folder, so the real site is never modified.
"""
import importlib.util
import io
import json
import os
import re
import shutil
import sys
import tempfile
import unittest
from contextlib import redirect_stderr, redirect_stdout

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
spec = importlib.util.spec_from_file_location("sync", os.path.join(REPO, "scripts", "substack_sync.py"))
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)

BASE = "https://example.substack.com"
PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64
JPG = b"\xff\xd8\xff\xe0" + b"\x00" * 64


from html.parser import HTMLParser


class Inspect(HTMLParser):
    """Parses output the way a browser would and records every tag and attribute it sees."""

    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.tags, self.attrs = [], []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.tags.append(tag)
        self.attrs += [(tag, k, v or "") for k, v in attrs]

    handle_startendtag = handle_starttag


ALLOWED_TAGS = set(sync.ALLOWED)


def read(path):
    with open(path, "rb") as f:
        return f.read()


def snapshot(root):
    return {os.path.relpath(os.path.join(dp, f), root): read(os.path.join(dp, f)) for dp, _, fs in os.walk(root) for f in fs}


class FakeSubstack:
    """Stands in for the network. `routes` maps URL -> bytes, dict/list (JSON) or Exception."""

    def __init__(self, routes):
        self.routes, self.calls = routes, []

    def __call__(self, url, as_json=False, limit=None):
        self.calls.append(url)
        if not url.startswith("https://"):
            raise ValueError("non-https")
        if url not in self.routes:
            raise OSError(f"404 {url}")
        v = self.routes[url]
        if isinstance(v, Exception):
            raise v
        if limit is not None and isinstance(v, bytes) and len(v) > limit:
            raise ValueError("too large")
        if as_json:
            return json.loads(v) if isinstance(v, bytes) else v
        return v


def api_routes(posts):
    """Build the JSON routes Substack would serve for a list of post dicts."""
    r = {f"{BASE}/api/v1/archive?sort=new&offset=0&limit=25": [{"slug": p["slug"], "audience": p.get("audience", "everyone"), "type": p.get("type", "newsletter")} for p in posts],
         f"{BASE}/api/v1/archive?sort=new&offset={len(posts)}&limit=25": []}
    for p in posts:
        r[f"{BASE}/api/v1/posts/{p['slug']}"] = {"title": p.get("title", "t"), "subtitle": p.get("subtitle", ""),
                                                 "post_date": p.get("date", "2026-01-02T00:00:00Z"),
                                                 "canonical_url": p.get("url", f"{BASE}/p/{p['slug']}"),
                                                 "body_html": p.get("body", "<p>hi</p>")}
    return r


class SiteCase(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        os.makedirs(os.path.join(self.tmp, "blog"))
        shutil.copy(os.path.join(REPO, "blog", "index.html"), os.path.join(self.tmp, "blog", "index.html"))
        self.saved = (sync.ROOT, sync.BLOG, sync.IMAGES, sync.get, sync.time.sleep)
        sync.ROOT, sync.BLOG, sync.IMAGES = self.tmp, os.path.join(self.tmp, "blog"), os.path.join(self.tmp, "images", "blog")
        sync.time.sleep = lambda s: None

    def tearDown(self):
        sync.ROOT, sync.BLOG, sync.IMAGES, sync.get, sync.time.sleep = self.saved
        shutil.rmtree(self.tmp)

    def run_sync(self, routes, *args):
        sync.get = FakeSubstack(routes)
        argv, sys.argv = sys.argv, ["sync", "--source", BASE, *args]
        out, err = io.StringIO(), io.StringIO()
        try:
            with redirect_stdout(out), redirect_stderr(err):
                sync.main()
        finally:
            sys.argv = argv
        return out.getvalue(), err.getvalue()

    def page(self, slug):
        with open(os.path.join(self.tmp, "blog", slug, "index.html"), encoding="utf-8") as f:
            return f.read()

    def body_of(self, slug):
        m = re.search(r'<div class="post-body">(.*?)\n      </div>', self.page(slug), re.S)
        return m.group(1)

    def index(self):
        with open(os.path.join(self.tmp, "blog", "index.html"), encoding="utf-8") as f:
            return f.read()


# ---------------------------------------------------------------- cross-site scripting (XSS)

XSS_BODIES = {
    "script tag": "<p>a</p><script>alert(1)</script><p>b</p>",
    "unclosed script": "<p>a</p><script>alert(1)",
    "self-closing script": "<script src=x /><p>b</p>",
    "event handler": '<p onclick="alert(1)">a</p><img src="https://cdn.x/a.png" onerror="alert(1)">',
    "javascript href": '<a href="javascript:alert(1)">x</a>',
    "uppercase javascript": '<a href="JaVaScRiPt:alert(1)">x</a>',
    "entity-encoded javascript": '<a href="&#106;avascript:alert(1)">x</a>',
    "leading space javascript": '<a href=" javascript:alert(1)">x</a>',
    "tab inside scheme": '<a href="java\tscript:alert(1)">x</a>',
    "data uri link": '<a href="data:text/html,<script>alert(1)</script>">x</a>',
    "vbscript": '<a href="vbscript:msgbox(1)">x</a>',
    "protocol-relative": '<a href="//evil.example/x">x</a>',
    "iframe": '<iframe src="https://evil.example"></iframe><p>after</p>',
    "svg onload": '<svg onload="alert(1)"><script>alert(1)</script></svg><p>after</p>',
    "math confusion": "<math><mi><style><img src=x onerror=alert(1)></style></mi></math><p>after</p>",
    "style tag": "<style>body{display:none}</style><p>after</p>",
    "style attribute": '<p style="position:fixed;inset:0">x</p>',
    "form": '<form action="https://evil.example"><input name=p></form><p>after</p>',
    "object/embed": '<object data="x"></object><embed src="x"><p>after</p>',
    "meta refresh": '<meta http-equiv="refresh" content="0;url=https://evil.example"><p>after</p>',
    "base tag": '<base href="https://evil.example/"><p>after</p>',
    "template": "<template><script>alert(1)</script></template><p>after</p>",
    "attribute breakout": '<a href="https://ok.example/" title=""><img src=x onerror=alert(1)>">x</a>',
    "quote breakout in href": '<a href="https://ok.example/&quot; onmouseover=&quot;alert(1)">x</a>',
    "comment trick": "<!--><script>alert(1)</script>--><p>after</p>",
    "cdata": "<![CDATA[<script>alert(1)</script>]]><p>after</p>",
    "nested drops": "<noscript><p><script>alert(1)</script></p></noscript><p>after</p>",
    "textarea": "<textarea><script>alert(1)</script></textarea><p>after</p>",
    "img javascript src": '<img src="javascript:alert(1)">',
    "img data src": '<img src="data:image/svg+xml,<svg onload=alert(1)>">',
    "img http (not https)": '<img src="http://cdn.example/a.png">',
}


class XSSTests(SiteCase):
    def test_hostile_bodies_never_reach_the_page(self):
        posts = [{"slug": f"p{i}", "body": b} for i, b in enumerate(XSS_BODIES.values())]
        routes = api_routes(posts)
        routes["https://cdn.x/a.png"] = PNG
        self.run_sync(routes)
        for i, (name, _) in enumerate(XSS_BODIES.items()):
            with self.subTest(name):
                found = Inspect(self.body_of(f"p{i}"))
                self.assertLessEqual(set(found.tags), ALLOWED_TAGS)          # only allowlisted tags exist
                for tag, k, v in found.attrs:
                    self.assertFalse(k.startswith("on"), (tag, k))           # no event handlers
                    self.assertIn(k, sync.ALLOWED[tag] + ["target", "rel"], (tag, k))
                    if k == "href":                                          # as the browser decodes it
                        self.assertRegex(v.strip().lower(), r"^(https?://|mailto:|#)")
                    if k == "src":
                        self.assertTrue(v.startswith("../../images/blog/"), v)

    def test_text_after_dropped_blocks_survives(self):
        posts = [{"slug": "keep", "body": "<iframe src=x></iframe><p>after-iframe</p><picture><source srcset=x><img src='https://cdn.x/a.png'></picture><p>after-picture</p>"}]
        routes = api_routes(posts)
        routes["https://cdn.x/a.png"] = PNG
        self.run_sync(routes)
        body = self.body_of("keep")
        self.assertIn("after-iframe", body)
        self.assertIn("after-picture", body)   # <source> is void; it must not swallow the rest of the post
        self.assertIn('src="../../images/blog/keep/', body)

    def test_title_subtitle_and_url_are_escaped(self):
        evil = '"><script>alert(1)</script><!-- POSTS:END -->'
        posts = [{"slug": "esc", "title": evil, "subtitle": evil, "url": "javascript:alert(1)"}]
        self.run_sync(api_routes(posts))
        page, index = self.page("esc"), self.index()
        for html_ in (page, index):
            self.assertNotIn("<script>alert", html_)
        self.assertEqual(index.count("<!-- POSTS:END -->"), 1)            # markers can't be injected
        self.assertIn(f'href="{BASE}/p/esc"', page)                      # bad canonical url replaced
        self.assertNotIn("javascript:", page)

    def test_unbalanced_tags_cannot_break_the_page(self):
        posts = [{"slug": "open", "body": "<blockquote><p><strong><em>never closed"}]
        self.run_sync(api_routes(posts))
        body = self.body_of("open")
        for t in ("blockquote", "p", "strong", "em"):
            self.assertEqual(body.count(f"<{t}>"), body.count(f"</{t}>"), t)
        self.assertIn('<p class="foot">', self.page("open"))   # the page's own footer still follows


# ---------------------------------------------------------------- paths and file system

class PathTests(SiteCase):
    def test_slug_path_traversal_is_rejected(self):
        bad = ["../../index", "..", ".", "a/b", "a\\b", "/etc", "index.html", "UPPER?", "a" * 300, "", " ", "x%2f..", "аpple"]
        posts = [{"slug": s} for s in bad] + [{"slug": "ok-post"}]
        routes = api_routes([{"slug": "ok-post"}])
        routes[f"{BASE}/api/v1/archive?sort=new&offset=0&limit=25"] = [{"slug": s} for s in bad] + [{"slug": "ok-post"}]
        routes[f"{BASE}/api/v1/archive?sort=new&offset={len(posts)}&limit=25"] = []
        for s in bad:   # serve each one so only validation can stop it
            routes[f"{BASE}/api/v1/posts/{sync.urllib.parse.quote(s, safe='')}"] = {"title": "x", "body_html": "<p>x</p>", "post_date": "2026-01-01"}
        before = set(os.listdir(self.tmp))
        self.run_sync(routes)
        self.assertEqual(sorted(os.listdir(os.path.join(self.tmp, "blog"))), ["index.html", "ok-post"])
        self.assertEqual(set(os.listdir(self.tmp)) - before, set())   # nothing written outside blog/ (no images here)

    def test_uppercase_slug_is_normalised_not_trusted(self):
        self.run_sync(api_routes([{"slug": "Hello-World"}]) | {f"{BASE}/api/v1/archive?sort=new&offset=0&limit=25": [{"slug": "Hello-World"}]})
        self.assertTrue(os.path.isdir(os.path.join(self.tmp, "blog", "hello-world")))

    def test_duplicate_slugs_written_once(self):
        routes = api_routes([{"slug": "dup"}])
        routes[f"{BASE}/api/v1/archive?sort=new&offset=0&limit=25"] = [{"slug": "dup"}, {"slug": "dup"}]
        routes[f"{BASE}/api/v1/archive?sort=new&offset=2&limit=25"] = []
        self.run_sync(routes)
        self.assertEqual(self.index().count('href="dup/"'), 1)

    def test_deleted_posts_are_removed_but_hand_made_folders_are_not(self):
        self.run_sync(api_routes([{"slug": "a"}, {"slug": "b"}, {"slug": "c"}]))
        os.makedirs(os.path.join(self.tmp, "blog", "handmade"))
        self.run_sync(api_routes([{"slug": "a"}, {"slug": "b"}]))
        names = set(os.listdir(os.path.join(self.tmp, "blog")))
        self.assertNotIn("c", names)
        self.assertIn("handmade", names)   # only folders the script made (marked) are ever deleted

    def test_empty_response_does_not_wipe_the_blog(self):
        self.run_sync(api_routes([{"slug": "a"}, {"slug": "b"}, {"slug": "c"}]))
        with self.assertRaises(SystemExit):
            self.run_sync(api_routes([]))
        self.assertEqual(len([n for n in os.listdir(os.path.join(self.tmp, "blog")) if n != "index.html"]), 3)
        self.run_sync(api_routes([]), "--allow-delete")   # deliberate wipe still possible
        self.assertEqual(os.listdir(os.path.join(self.tmp, "blog")), ["index.html"])

    def test_missing_markers_fail_loudly(self):
        with open(os.path.join(self.tmp, "blog", "index.html"), "w") as f:
            f.write("<html><body>no markers</body></html>")
        with self.assertRaises(SystemExit):
            self.run_sync(api_routes([{"slug": "a"}]))


# ---------------------------------------------------------------- images

class ImageTests(SiteCase):
    def run_with_image(self, payload):
        routes = api_routes([{"slug": "img", "body": '<p>x</p><img src="https://cdn.x/i" alt="a"><p>y</p>'}])
        routes["https://cdn.x/i"] = payload
        self.run_sync(routes)
        return self.body_of("img")

    def test_real_images_are_copied_with_the_right_type(self):
        body = self.run_with_image(PNG)
        self.assertRegex(body, r'src="\.\./\.\./images/blog/img/[0-9a-f]{12}\.png"')
        body2 = self.run_with_image(JPG)
        self.assertIn(".png", body2)   # cached by URL: the second run reuses the first download

    def test_html_or_svg_disguised_as_image_is_dropped(self):
        for payload in (b"<html><script>alert(1)</script></html>", b'<svg onload="alert(1)"/>', b""):
            with self.subTest(payload[:10]):
                shutil.rmtree(os.path.join(self.tmp, "images"), ignore_errors=True)
                body = self.run_with_image(payload)
                self.assertNotIn("<img", body)
                self.assertIn("y", body)

    def test_oversized_and_failing_images_do_not_crash(self):
        self.assertNotIn("<img", self.run_with_image(PNG + b"\x00" * (sync.MAX_IMAGE_BYTES + 1)))
        shutil.rmtree(os.path.join(self.tmp, "images"), ignore_errors=True)
        self.assertNotIn("<img", self.run_with_image(TimeoutError("slow")))


# ---------------------------------------------------------------- broken or hostile upstream data

class UpstreamTests(SiteCase):
    def test_api_down_falls_back_to_rss(self):
        rss = (b'<?xml version="1.0"?><rss xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel>'
               b'<item><title>From RSS</title><link>https://example.substack.com/p/from-rss</link>'
               b'<pubDate>Tue, 20 Oct 2026 10:00:00 GMT</pubDate><description>sub</description>'
               b'<content:encoded><![CDATA[<p>rss body</p><script>alert(1)</script>]]></content:encoded></item></channel></rss>')
        out, err = self.run_sync({f"{BASE}/api/v1/archive?sort=new&offset=0&limit=25": OSError("429"), f"{BASE}/feed": rss})
        self.assertIn("via rss", out)
        body = self.body_of("from-rss")
        self.assertIn("rss body", body)
        self.assertNotIn("script", body)

    def test_xml_bomb_is_refused(self):
        bomb = (b'<?xml version="1.0"?><!DOCTYPE lolz [<!ENTITY lol "lol"><!ENTITY lol2 "&lol;&lol;&lol;&lol;">]>'
                b'<rss><channel><item><title>&lol2;</title></item></channel></rss>')
        with self.assertRaises(ValueError):
            sync.get = FakeSubstack({f"{BASE}/feed": bomb})
            sync.fetch_from_rss(BASE)

    def test_wrong_shapes_from_api(self):
        for archive in ({"error": "x"}, "string", 42, None):
            with self.subTest(archive):
                sync.get = FakeSubstack({f"{BASE}/api/v1/archive?sort=new&offset=0&limit=25": archive})
                with self.assertRaises(Exception):
                    sync.fetch_from_api(BASE)

    def test_garbage_entries_are_skipped(self):
        routes = api_routes([{"slug": "fine"}])
        routes[f"{BASE}/api/v1/archive?sort=new&offset=0&limit=25"] = [None, 5, "x", {"no": "slug"}, {"slug": 7}, {"slug": "fine"}]
        routes[f"{BASE}/api/v1/archive?sort=new&offset=6&limit=25"] = []
        self.run_sync(routes)
        self.assertTrue(os.path.isdir(os.path.join(self.tmp, "blog", "fine")))

    def test_paid_and_podcast_posts_are_ignored(self):
        posts = [{"slug": "free"}, {"slug": "paid", "audience": "only_paid"}, {"slug": "pod", "type": "podcast"}]
        self.run_sync(api_routes(posts))
        self.assertEqual(sorted(os.listdir(os.path.join(self.tmp, "blog"))), ["free", "index.html"])

    def test_bad_dates_unicode_and_huge_bodies(self):
        posts = [{"slug": "d1", "date": "not a date", "title": "naïve café — 日本語 🎵"},
                 {"slug": "d2", "date": "2026-13-45T00:00:00Z"},
                 {"slug": "big", "body": "<p>" + "word " * 600_000 + "</p>"}]
        self.run_sync(api_routes(posts))
        self.assertIn("日本語 🎵", self.page("d1"))
        self.assertLessEqual(len(self.page("big")), sync.MAX_BODY_CHARS + 20_000)

    def test_runaway_pagination_stops(self):
        class Endless(FakeSubstack):
            def __call__(self, url, as_json=False, limit=None):
                self.calls.append(url)
                if "/archive" in url:
                    n = int(re.search(r"offset=(\d+)", url).group(1))
                    return [{"slug": f"s{n + i}", "audience": "only_paid"} for i in range(25)]
                raise OSError
        sync.get = Endless({})
        self.assertEqual(sync.fetch_from_api(BASE), [])
        self.assertLess(len(sync.get.calls), 300)

    def test_non_https_is_refused_by_the_real_fetcher(self):
        get = self.saved[3]
        for url in ("http://example.com", "file:///etc/passwd", "ftp://x"):
            with self.subTest(url), self.assertRaises(ValueError):
                get(url)


# ---------------------------------------------------------------- generated pages meet the site rules

class GeneratedPageTests(SiteCase):
    def test_hostile_posts_produce_pages_that_pass_the_site_checks(self):
        sys.path.insert(0, HERE)
        import test_site as site
        posts = [{"slug": f"p{i}", "body": b, "title": b[:80]} for i, b in enumerate(XSS_BODIES.values())]
        self.run_sync(api_routes(posts))
        for slug in [f"p{i}" for i in range(len(posts))] + [None]:
            path = os.path.join(self.tmp, "blog", slug, "index.html") if slug else os.path.join(self.tmp, "blog", "index.html")
            with self.subTest(slug):
                with open(path, encoding="utf-8") as f:
                    p = site.Page(f.read())
                self.assertTrue(p.csp)                                   # the post page keeps the CSP
                self.assertEqual(p.inline_scripts, [])
                for tag, attrs in p.tags:
                    self.assertNotIn(tag, ("iframe", "object", "embed", "form", "base"))
                    for k, v in attrs:
                        self.assertFalse(k.startswith("on"))
                        self.assertNotEqual(k, "style")
                    if tag == "script":
                        prefix = "../../" if slug else "../"
                        self.assertRegex(dict(attrs).get("src", ""), r"^" + re.escape(prefix) + r"[a-z]+\.js\?v=\d+$")   # only the site's own scripts


# ---------------------------------------------------------------- relay (Cloudflare Worker) mode

class RelayTests(unittest.TestCase):
    def setUp(self):
        self.saved = (sync.RELAY, sync.RELAY_KEY, sync.urllib.request.urlopen)
        self.seen = []

        class Resp(io.BytesIO):
            def __enter__(s):
                return s

            def __exit__(s, *a):
                return False

        def fake_urlopen(req, timeout=None):
            self.seen.append(req)
            return Resp(b"[]")
        sync.urllib.request.urlopen = fake_urlopen

    def tearDown(self):
        sync.RELAY, sync.RELAY_KEY, sync.urllib.request.urlopen = self.saved

    def test_requests_go_through_the_relay_with_the_key(self):
        sync.RELAY, sync.RELAY_KEY = "https://relay.example", "secret-key-123"
        sync.get("https://shrvvn.substack.com/api/v1/archive?sort=new&offset=0&limit=25", as_json=True)
        req = self.seen[0]
        self.assertTrue(req.full_url.startswith("https://relay.example/?url=https%3A%2F%2Fshrvvn.substack.com%2Fapi"))
        self.assertEqual(req.get_header("X-relay-key"), "secret-key-123")

    def test_relay_must_be_https_and_keyed(self):
        for relay, key in (("http://relay.example", "k"), ("https://relay.example", "")):
            with self.subTest(relay=relay, key=bool(key)):
                sync.RELAY, sync.RELAY_KEY = relay, key
                with self.assertRaises(ValueError):
                    sync.get("https://shrvvn.substack.com/feed")
        self.assertEqual(self.seen, [])   # nothing was sent

    def test_without_relay_it_talks_to_substack_directly(self):
        sync.RELAY, sync.RELAY_KEY = "", ""
        sync.get("https://shrvvn.substack.com/feed")
        self.assertEqual(self.seen[0].full_url, "https://shrvvn.substack.com/feed")
        self.assertIsNone(self.seen[0].get_header("X-relay-key"))


# ---------------------------------------------------------------- idempotence

class StabilityTests(SiteCase):
    def test_old_posts_come_from_the_cache_not_the_network(self):
        posts = [{"slug": "old", "date": "2020-01-01T00:00:00Z", "body": "<p>original</p>"},
                 {"slug": "new", "date": sync.datetime.now().strftime("%Y-%m-%d") + "T00:00:00Z"}]
        routes = api_routes(posts)
        routes[f"{BASE}/api/v1/archive?sort=new&offset=0&limit=25"] = [{"slug": p["slug"], "post_date": p["date"]} for p in posts]
        self.run_sync(routes)
        self.run_sync(routes)
        calls = sync.get.calls
        self.assertNotIn(f"{BASE}/api/v1/posts/old", calls)   # 2020 post: reused
        self.assertIn(f"{BASE}/api/v1/posts/new", calls)      # recent post: re-fetched for edits
        self.assertIn("original", self.body_of("old"))

    def test_tampered_cache_is_still_cleaned(self):
        posts = [{"slug": "old", "date": "2020-01-01T00:00:00Z"}]
        routes = api_routes(posts)
        routes[f"{BASE}/api/v1/archive?sort=new&offset=0&limit=25"] = [{"slug": "old", "post_date": posts[0]["date"]}]
        self.run_sync(routes)
        path = os.path.join(self.tmp, "blog", "old", ".from-substack")
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        data.update(body='<script>alert(1)</script><a href="javascript:x">y</a>', url="javascript:alert(1)", slug="old")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f)
        self.run_sync(routes)
        page = self.page("old")
        self.assertNotIn("<script>alert", page)
        self.assertNotIn("javascript:", page)

    def test_corrupt_cache_is_ignored(self):
        posts = [{"slug": "old", "date": "2020-01-01T00:00:00Z"}]
        routes = api_routes(posts)
        routes[f"{BASE}/api/v1/archive?sort=new&offset=0&limit=25"] = [{"slug": "old", "post_date": posts[0]["date"]}]
        self.run_sync(routes)
        with open(os.path.join(self.tmp, "blog", "old", ".from-substack"), "w") as f:
            f.write("{not json")
        self.run_sync(routes)
        self.assertIn(f"{BASE}/api/v1/posts/old", sync.get.calls)

    def test_running_twice_changes_nothing(self):
        routes = api_routes([{"slug": "a", "body": "<p>x</p>"}, {"slug": "b"}])
        self.run_sync(routes)
        snap = snapshot(self.tmp)
        self.run_sync(routes)
        self.assertEqual(snap, snapshot(self.tmp))

    def test_dry_run_writes_nothing(self):
        before = snapshot(self.tmp)
        self.run_sync(api_routes([{"slug": "a"}]), "--dry-run")
        self.assertEqual(snapshot(self.tmp), before)


if __name__ == "__main__":
    unittest.main()
