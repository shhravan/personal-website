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
UA = {"User-Agent": "shravanlad-site-sync/1.0 (+https://github.com/shhravan/personal-website)"}


# ---------- 1. fetch ----------

def get(url, as_json=False):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    return json.loads(data) if as_json else data


def fetch_from_api(base):
    """The endpoints Substack's own site uses. Undocumented, so they may change one day."""
    posts, offset = [], 0
    while True:
        page = get(f"{base}/api/v1/archive?sort=new&offset={offset}&limit=25", as_json=True)
        if not page:
            break
        for p in page:
            if p.get("audience", "everyone") != "everyone" or p.get("type") not in (None, "newsletter"):
                continue   # only free, written posts (no paid-only posts or podcasts)
            time.sleep(1)   # be polite: Substack rate-limits rapid requests (HTTP 429)
            full = get(f"{base}/api/v1/posts/{p['slug']}", as_json=True)
            posts.append({
                "slug": p["slug"],
                "title": full.get("title") or p.get("title", ""),
                "subtitle": full.get("subtitle") or "",
                "date": (full.get("post_date") or p.get("post_date") or "")[:10],
                "url": full.get("canonical_url") or f"{base}/p/{p['slug']}",
                "body": full.get("body_html") or "",
            })
        offset += len(page)
    return posts


def fetch_from_rss(base):
    """Substack's official RSS feed: always there, slightly less detail."""
    ns = {"content": "http://purl.org/rss/1.0/modules/content/"}
    root = ET.fromstring(get(f"{base}/feed"))
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
        return fetch_from_api(base), "api"
    except Exception as e:   # the API changed or is down: use the feed instead
        print(f"api failed ({e}); using rss", file=sys.stderr)
        return fetch_from_rss(base), "rss"


# ---------- 2. transform ----------

ALLOWED = {
    "p": [], "br": [], "hr": [], "h2": [], "h3": [], "h4": [], "strong": [], "b": [], "em": [], "i": [],
    "u": [], "s": [], "blockquote": [], "ul": [], "ol": [], "li": [], "pre": [], "code": [],
    "a": ["href"], "img": ["src", "alt"], "figure": [], "figcaption": [], "sup": [], "sub": [],
}
DROP_WITH_CONTENT = {"script", "style", "iframe", "button", "form", "svg", "noscript", "source"}
VOID = {"br", "hr", "img"}


class Cleaner(HTMLParser):
    """Rebuilds the post's HTML keeping only an allowlist of tags and attributes.
    Anything else (scripts, embeds, Substack's buttons and styling) is left out."""

    def __init__(self, image_hook):
        super().__init__(convert_charrefs=True)
        self.out, self.skip, self.image_hook = [], 0, image_hook

    def handle_starttag(self, tag, attrs):
        if tag in DROP_WITH_CONTENT and tag not in VOID:
            self.skip += 1
            return
        if self.skip or tag not in ALLOWED:
            return
        kept = []
        for k, v in attrs:
            if k not in ALLOWED[tag] or v is None:
                continue
            if k == "href" and not re.match(r"^(https?:|mailto:|#)", v):
                continue   # no javascript: links
            if k == "src":
                v = self.image_hook(v)
                if not v:
                    return
            kept.append(f'{k}="{html.escape(v, quote=True)}"')
        if tag == "a":
            kept.append('target="_blank" rel="noopener"')
        self.out.append(f"<{tag}{' ' + ' '.join(kept) if kept else ''}>")

    def handle_endtag(self, tag):
        if tag in DROP_WITH_CONTENT and tag not in VOID:
            self.skip = max(0, self.skip - 1)
            return
        if not self.skip and tag in ALLOWED and tag not in VOID:
            self.out.append(f"</{tag}>")

    def handle_data(self, data):
        if not self.skip:
            self.out.append(html.escape(data, quote=False))


def localise_image(slug, dry_run):
    """Download each image into images/blog/<slug>/ and point the post at the copy, so the site
    doesn't depend on Substack's servers and its security policy can stay strict."""
    def hook(src):
        if not src.startswith("http"):
            return None
        name = hashlib.sha1(src.encode()).hexdigest()[:12]
        ext = os.path.splitext(urllib.parse.urlparse(src).path)[1].lower()
        ext = ext if ext in (".jpg", ".jpeg", ".png", ".gif", ".webp") else ".jpg"
        rel = f"images/blog/{slug}/{name}{ext}"
        path = os.path.join(ROOT, rel)
        if not dry_run and not os.path.exists(path):
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "wb") as f:
                f.write(get(src))
        return "../../" + rel
    return hook


def clean(post, dry_run):
    c = Cleaner(localise_image(post["slug"], dry_run))
    c.feed(post["body"])
    body = "".join(c.out)
    words = len(re.sub(r"<[^>]+>", " ", body).split())
    return body, max(1, round(words / 230))


# ---------- 3. render ----------

def nice_date(iso):
    try:
        return datetime.strptime(iso, "%Y-%m-%d").strftime("%B %-d, %Y").lower()
    except ValueError:
        return iso


def render(posts, dry_run):
    index_path = os.path.join(BLOG, "index.html")
    index = open(index_path, encoding="utf-8").read()
    head = index[:index.index("<body>")]
    foot = index[index.index('    <p class="foot">'):]
    # A post page lives one folder deeper than the blog list, so its links to shared files gain a "../".
    post_head = re.sub(r'(href|src)="\.\./', r'\1="../../', head)

    rows = []
    for p in posts:
        body, minutes = clean(p, dry_run)
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
      <p class="post-meta">{date} · {minutes} min read · <a href="{html.escape(p['url'])}" target="_blank" rel="noopener">also on substack</a></p>
      <div class="post-body">
{body}
      </div>
    </article>

""" + re.sub(r'(href|src)="\.\./', r'\1="../../', foot)
        rows.append(f'      <li><a href="{p["slug"]}/">{title}</a><span class="date">{date}</span></li>')
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
        if os.path.isdir(d) and name not in keep and os.path.exists(os.path.join(d, ".from-substack")) and not dry_run:
            for f in os.listdir(d):
                os.remove(os.path.join(d, f))
            os.rmdir(d)
    if not dry_run:
        for p in posts:
            open(os.path.join(BLOG, p["slug"], ".from-substack"), "w").close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--source", default=PUBLICATION, help="publication URL (for testing)")
    args = ap.parse_args()
    posts, via = fetch(args.source.rstrip("/"))
    posts.sort(key=lambda p: p["date"], reverse=True)
    print(f"{len(posts)} posts via {via}")
    render(posts, args.dry_run)


if __name__ == "__main__":
    main()
