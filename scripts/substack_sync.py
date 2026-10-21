#!/usr/bin/env python3
"""Copy Shravan's Substack posts onto the website's blog.

A small content pipeline, run on a schedule by .github/workflows/substack.yml:

  1. fetch      ask Substack for the list of posts and each post's full text (JSON API),
                falling back to the official RSS feed if the API stops working
  2. transform  clean the HTML (keep safe tags only), download images into the repo
  3. render     write blog/<slug>/index.html for each post and the list in blog/index.html

Only the Python standard library is used. Run it yourself with:
    python3 scripts/substack_sync.py            (writes into the repo)
    python3 scripts/substack_sync.py --dry-run  (fetches and reports, writes nothing)
"""
import argparse
import hashlib
import html
import json
import os
import re
import shutil
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime
from html.parser import HTMLParser

PUBLICATION = "https://shrvvn.substack.com"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLOG = os.path.join(ROOT, "blog")
IMAGES = os.path.join(ROOT, "images", "blog")
SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,150}$")   # only these become folder names (no "../", no dots)
MAX_IMAGE_BYTES = 10 * 1024 * 1024
MAX_BODY_CHARS = 2_000_000
IMAGE_MAGIC = {b"\xff\xd8\xff": ".jpg", b"\x89PNG\r\n\x1a\n": ".png", b"GIF87a": ".gif", b"GIF89a": ".gif"}
UA = {"User-Agent": "shravanlad-site-sync/1.0 (+https://github.com/shhravan/personal-website)"}


# ---------- 1. fetch ----------

# Substack blocks GitHub's machines, so in the Action every request goes through our Cloudflare
# Worker (worker/feed-relay.js). Locally, with these unset, the script talks to Substack directly.
RELAY = os.environ.get("SUBSTACK_RELAY_URL", "").rstrip("/")
RELAY_KEY = os.environ.get("SUBSTACK_RELAY_KEY", "")


def get(url, as_json=False, limit=20 * 1024 * 1024):
    if not url.startswith("https://"):
        raise ValueError(f"refusing non-https url: {url!r}")
    if RELAY:
        if not RELAY.startswith("https://") or not RELAY_KEY:
            raise ValueError("SUBSTACK_RELAY_URL must be https and SUBSTACK_RELAY_KEY must be set")
        req = urllib.request.Request(f"{RELAY}/?url={urllib.parse.quote(url, safe='')}",
                                     headers={**UA, "X-Relay-Key": RELAY_KEY})
    else:
        req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read(limit + 1)
    if len(data) > limit:
        raise ValueError(f"response too large: {url}")
    return json.loads(data) if as_json else data


REFRESH_DAYS = 30   # posts newer than this are re-fetched every run (to pick up edits); older ones come from the cache


def load_cache():
    """Each post folder keeps the raw post it was built from (.from-substack), so old posts don't
    need fetching again. Returns {slug: post}."""
    cache = {}
    if not os.path.isdir(BLOG):
        return cache
    for name in os.listdir(BLOG):
        path = os.path.join(BLOG, name, ".from-substack")
        try:
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, dict) and data.get("slug") == name:
                cache[name] = data
        except (OSError, ValueError):
            continue
    return cache


def is_recent(iso):
    try:
        return (datetime.now() - datetime.strptime(iso[:10], "%Y-%m-%d")).days <= REFRESH_DAYS
    except ValueError:
        return True


def fetch_from_api(base, cache=None):
    """The endpoints Substack's own site uses. Undocumented, so they may change one day."""
    cache = cache or {}
    posts, offset = [], 0
    while True:
        page = get(f"{base}/api/v1/archive?sort=new&offset={offset}&limit=25", as_json=True)
        if not isinstance(page, list):
            raise ValueError("archive did not return a list")
        if not page:
            break
        for p in page:
            if not isinstance(p, dict) or not isinstance(p.get("slug"), str):
                continue
            if p.get("audience", "everyone") != "everyone" or p.get("type") not in (None, "newsletter"):
                continue   # only free, written posts (no paid-only posts or podcasts)
            listed_date = str(p.get("post_date") or "")[:10]
            cached = cache.get(str(p["slug"]).strip().lower())
            if cached and cached.get("date") == listed_date and not is_recent(listed_date):
                posts.append(cached)   # unchanged old post: no request needed
                continue
            time.sleep(1)   # be polite: Substack rate-limits rapid requests (HTTP 429)
            full = get(f"{base}/api/v1/posts/{urllib.parse.quote(p['slug'], safe='')}", as_json=True)
            if not isinstance(full, dict):
                continue
            posts.append({
                "slug": p["slug"],
                "title": full.get("title") or p.get("title", ""),
                "subtitle": full.get("subtitle") or "",
                "date": (full.get("post_date") or p.get("post_date") or "")[:10],
                "url": full.get("canonical_url") or f"{base}/p/{p['slug']}",
                "body": full.get("body_html") or "",
            })
        offset += len(page)
        if offset > 5000:   # runaway pagination guard
            break
    return posts


def fetch_from_rss(base):
    """Substack's official RSS feed: always there, slightly less detail."""
    ns = {"content": "http://purl.org/rss/1.0/modules/content/"}
    raw = get(f"{base}/feed")
    if b"<!DOCTYPE" in raw[:2000] or b"<!ENTITY" in raw:   # no DTDs: blocks "billion laughs" XML bombs
        raise ValueError("feed contains a DTD; refusing to parse")
    root = ET.fromstring(raw)
    posts = []
    for item in root.iter("item"):
        link = item.findtext("link") or ""
        when = item.findtext("pubDate") or ""
        try:
            date = datetime.strptime(when[:25].strip(), "%a, %d %b %Y %H:%M:%S").strftime("%Y-%m-%d")
        except ValueError:
            date = ""
        posts.append({
            "slug": link.rstrip("/").rsplit("/", 1)[-1],
            "title": item.findtext("title") or "",
            "subtitle": item.findtext("description") or "",
            "date": date,
            "url": link,
            "body": item.findtext("content:encoded", namespaces=ns) or "",
        })
    return posts


def fetch(base):
    try:
        return fetch_from_api(base, load_cache()), "api"
    except Exception as e:   # the API changed or is down: use the feed instead
        print(f"api failed ({e}); using rss", file=sys.stderr)
        return fetch_from_rss(base), "rss"


# ---------- 2. transform ----------

ALLOWED = {
    "p": [], "br": [], "hr": [], "h2": [], "h3": [], "h4": [], "strong": [], "b": [], "em": [], "i": [],
    "u": [], "s": [], "blockquote": [], "ul": [], "ol": [], "li": [], "pre": [], "code": [],
    "a": ["href"], "img": ["src", "alt"], "figure": [], "figcaption": [], "sup": [], "sub": [],
}
DROP_WITH_CONTENT = {"script", "style", "iframe", "button", "form", "svg", "noscript", "object",
                     "embed", "template", "select", "textarea", "math", "head", "title"}
VOID = {"br", "hr", "img", "source", "input", "meta", "link", "wbr", "area", "base", "col", "param", "track"}
SAFE_HREF = re.compile(r"^(https?://|mailto:|#)", re.I)


class Cleaner(HTMLParser):
    """Rebuilds the post's HTML keeping only an allowlist of tags and attributes.
    Anything else (scripts, embeds, Substack's buttons and styling) is left out."""

    def __init__(self, image_hook):
        super().__init__(convert_charrefs=True)
        self.out, self.skip, self.image_hook = [], 0, image_hook

    def handle_starttag(self, tag, attrs):
        if tag in DROP_WITH_CONTENT:
            self.skip += 1
            return
        if self.skip or tag not in ALLOWED:
            return
        kept = []
        for k, v in attrs:
            if k not in ALLOWED[tag] or v is None:
                continue
            if k == "href" and not SAFE_HREF.match(v):
                continue   # no javascript:, data:, vbscript: or protocol-relative links
            if k == "src":
                v = self.image_hook(v)
                if not v:
                    return
            kept.append(f'{k}="{html.escape(v, quote=True)}"')
        if tag == "a":
            kept.append('target="_blank" rel="noopener"')
        self.out.append(f"<{tag}{' ' + ' '.join(kept) if kept else ''}>")

    def handle_startendtag(self, tag, attrs):   # <br/>, <img .../>, <script/>
        if tag in DROP_WITH_CONTENT:
            return
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag):
        if tag in DROP_WITH_CONTENT:
            self.skip = max(0, self.skip - 1)
            return
        if not self.skip and tag in ALLOWED and tag not in VOID:
            self.out.append(f"</{tag}>")

    def handle_data(self, data):
        if not self.skip:
            self.out.append(html.escape(data, quote=False))

    def result(self):
        """Close any tags the source left open, so a broken post can't break the page around it."""
        stack = []
        for piece in self.out:
            m = re.match(r"^<(/?)([a-z0-9]+)", piece)
            if not m or m.group(2) in VOID:
                continue
            if m.group(1):
                if m.group(2) in stack:
                    while stack and stack.pop() != m.group(2):
                        pass
            else:
                stack.append(m.group(2))
        return "".join(self.out) + "".join(f"</{t}>" for t in reversed(stack))


def localise_image(slug, dry_run):
    """Download each image into images/blog/<slug>/ and point the post at the copy, so the site
    doesn't depend on Substack's servers and its security policy can stay strict.
    Only real https images under 10 MB are kept; anything else is dropped, never fatal."""
    def hook(src):
        if not src.startswith("https://"):
            return None
        name = hashlib.sha1(src.encode()).hexdigest()[:12]
        if dry_run:
            return f"../../images/blog/{slug}/{name}.jpg"
        folder = os.path.join(IMAGES, slug)
        for ext in (".jpg", ".png", ".gif", ".webp"):
            if os.path.exists(os.path.join(folder, name + ext)):
                return f"../../images/blog/{slug}/{name}{ext}"
        try:
            data = get(src, limit=MAX_IMAGE_BYTES)
        except Exception as e:
            print(f"  image skipped ({e}): {src[:80]}", file=sys.stderr)
            return None
        ext = next((e for magic, e in IMAGE_MAGIC.items() if data.startswith(magic)), None)
        if ext is None and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
            ext = ".webp"
        if ext is None:   # not actually an image (an HTML error page, an SVG with scripts...): drop it
            print(f"  not an image, skipped: {src[:80]}", file=sys.stderr)
            return None
        os.makedirs(folder, exist_ok=True)
        with open(os.path.join(folder, name + ext), "wb") as f:
            f.write(data)
        return f"../../images/blog/{slug}/{name}{ext}"
    return hook


def clean(post, dry_run):
    c = Cleaner(localise_image(post["slug"], dry_run))
    c.feed(post["body"][:MAX_BODY_CHARS])
    c.close()
    body = c.result()
    words = len(re.sub(r"<[^>]+>", " ", body).split())
    return body, max(1, round(words / 230))


# ---------- 3. render ----------

def nice_date(iso):
    try:
        return datetime.strptime(iso, "%Y-%m-%d").strftime("%B %-d, %Y").lower()
    except ValueError:
        return iso


def validate(posts, base):
    """Drop anything that could escape the blog folder or point visitors somewhere odd."""
    seen, good = set(), []
    for p in posts:
        slug = str(p.get("slug", "")).strip().lower()
        if not SLUG_RE.match(slug) or slug in seen:
            print(f"  skipped post with unsafe or duplicate slug: {slug[:60]!r}", file=sys.stderr)
            continue
        seen.add(slug)
        url = str(p.get("url") or "")
        if not re.match(r"^https://[a-z0-9.-]+/", url, re.I):
            url = f"{base}/p/{slug}"
        date = str(p.get("date") or "")
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
            date = ""
        good.append({"slug": slug, "url": url, "date": date,
                     "title": str(p.get("title") or slug)[:300],
                     "subtitle": str(p.get("subtitle") or "")[:600],
                     "body": str(p.get("body") or "")})
    return good


def render(posts, dry_run):
    index_path = os.path.join(BLOG, "index.html")
    index = open(index_path, encoding="utf-8").read()
    if "<!-- POSTS:START -->" not in index or "<!-- POSTS:END -->" not in index or "<body>" not in index:
        raise SystemExit("blog/index.html is missing its <body> or POSTS markers; refusing to guess")
    head = index[:index.index("<body>")]
    foot = index[index.index('    <p class="foot">'):]
    # A post page lives one folder deeper than the blog list, so its links to shared files gain a "../".
    post_head = re.sub(r'(href|src)="\.\./', r'\1="../../', head)

    rows = []
    for p in posts:
        try:
            body, minutes = clean(p, dry_run)
        except Exception as e:   # one bad post shouldn't stop the others
            print(f"  post skipped ({e}): {p['slug']}", file=sys.stderr)
            continue
        title = html.escape(p["title"])
        date = nice_date(p["date"])
        page = (post_head
                .replace("<title>blog · shravan lad</title>", f"<title>{title} · shravan lad</title>")
                # tells search engines the Substack post is the original, so this copy isn't penalised
                .replace("</head>", f'  <link rel="canonical" href="{html.escape(p["url"])}">\n</head>'))
        page += f"""<body>
  <a class="logo" href="../../" aria-label="श्रवण लाड · Shravan Lad, home"></a>
  <main class="col page post">
    <a class="back" href="../">← blog</a>
    <article>
      <h1>{title}</h1>
      {f'<p class="post-sub">{html.escape(p["subtitle"])}</p>' if p["subtitle"] else ''}
      <p class="post-meta">{html.escape(date)} · {minutes} min read · <a href="{html.escape(p['url'])}" target="_blank" rel="noopener">also on substack</a></p>
      <div class="post-body">
{body}
      </div>
    </article>

""" + re.sub(r'(href|src)="\.\./', r'\1="../../', foot)
        rows.append(f'      <li><a href="{p["slug"]}/">{title}</a><span class="date">{html.escape(date)}</span></li>')
        if not dry_run:
            os.makedirs(os.path.join(BLOG, p["slug"]), exist_ok=True)
            with open(os.path.join(BLOG, p["slug"], "index.html"), "w", encoding="utf-8") as f:
                f.write(page)

    listing = "\n".join(rows) if rows else '      <li class="empty">first post coming soon.</li>'
    new_index = re.sub(r"(<!-- POSTS:START -->\n).*?(\n\s*<!-- POSTS:END -->)",
                       lambda m: m.group(1) + listing + m.group(2), index, flags=re.S)
    if not dry_run and new_index != index:
        with open(index_path, "w", encoding="utf-8") as f:
            f.write(new_index)

    # Posts deleted on Substack: remove their pages too.
    keep = {p["slug"] for p in posts}
    for name in os.listdir(BLOG):
        d = os.path.join(BLOG, name)
        if os.path.isdir(d) and not os.path.islink(d) and name not in keep \
                and os.path.exists(os.path.join(d, ".from-substack")) and not dry_run:
            shutil.rmtree(d)
            shutil.rmtree(os.path.join(IMAGES, name), ignore_errors=True)
    if not dry_run:
        for p in posts:
            if os.path.isdir(os.path.join(BLOG, p["slug"])):
                with open(os.path.join(BLOG, p["slug"], ".from-substack"), "w", encoding="utf-8") as f:
                    json.dump(p, f, ensure_ascii=False, sort_keys=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--source", default=PUBLICATION, help="publication URL (for testing)")
    ap.add_argument("--allow-delete", action="store_true", help="allow removing many posts at once")
    args = ap.parse_args()
    base = args.source.rstrip("/")
    posts, via = fetch(base)
    posts = validate(posts, base)
    posts.sort(key=lambda p: p["date"], reverse=True)
    print(f"{len(posts)} posts via {via}")
    # Safety net: if Substack hiccups and returns nothing (or far fewer posts than we already
    # have), don't wipe the blog. Deleting more than half the posts needs --allow-delete.
    existing = existing_posts()
    if existing and len({p["slug"] for p in posts} & existing) < len(existing) / 2 and not args.allow_delete:
        raise SystemExit(f"refusing: Substack returned {len(posts)} posts but {len(existing)} are on the site "
                         "(run with --allow-delete if you really removed them)")
    render(posts, args.dry_run)


def existing_posts():
    if not os.path.isdir(BLOG):
        return set()
    return {n for n in os.listdir(BLOG) if os.path.exists(os.path.join(BLOG, n, ".from-substack"))}


if __name__ == "__main__":
    main()
