"""Builds the notebook on the blog page from the files in notes/.

Each note is a plain text file named notes/YYYY-MM-DD-anything.md. Write it on github.com or in the
GitHub app (Add file → Create new file); when it's saved, a GitHub job runs this script and the note
appears at the top of shravanlad.com/blog/. Visitors never see a way to write.

Inside a note:
  # an optional title on the first line
  plain paragraphs, separated by a blank line
  [words](https://link) for a link (shravanlad.com pages too, e.g. [work](/work/))
  *italic* and **bold**
"""
import html, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOTES = os.path.join(ROOT, "notes")
INDEX = os.path.join(ROOT, "blog", "index.html")
NAME = re.compile(r"^(\d{4})-(\d{2})-(\d{2})-[a-z0-9-]+\.md$")
MONTHS = "jan feb mar apr may jun jul aug sep oct nov dec".split()
SAFE_LINK = re.compile(r"^(https?://|/|#|mailto:)", re.I)   # no javascript: or other schemes


def inline(text):
    """Escape the text, then turn the few markdown marks we allow into HTML."""
    t = html.escape(text, quote=True)
    def link(m):
        url = html.unescape(m.group(2)).strip()
        if not SAFE_LINK.match(url):
            return m.group(1)
        ext = url.startswith("http") and "shravanlad.com" not in url
        attrs = ' target="_blank" rel="noopener"' if ext else ""
        return f'<a href="{html.escape(url, quote=True)}"{attrs}>{m.group(1)}</a>'
    t = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", link, t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"\*(.+?)\*", r"<em>\1</em>", t)
    return t


def render_note(name, text):
    y, m, d = NAME.match(name).groups()
    blocks = [b.strip() for b in re.split(r"\n\s*\n", text.strip()) if b.strip()]
    title = ""
    if blocks and blocks[0].startswith("# "):
        title = blocks.pop(0)[2:].strip()
    body = "".join(f"<p>{inline(' '.join(b.split()))}</p>" for b in blocks)
    head = f"<h3>{inline(title)}</h3>" if title else ""
    date = f"{int(d)} {MONTHS[int(m) - 1]} {y}"
    return f'      <li class="note"><span class="note-date">{date}</span><div class="note-body">{head}{body}</div></li>'


def main():
    names = sorted((n for n in os.listdir(NOTES) if NAME.match(n)), reverse=True) if os.path.isdir(NOTES) else []
    rows = [render_note(n, open(os.path.join(NOTES, n), encoding="utf-8").read()) for n in names]
    listing = "\n".join(rows) if rows else '      <li class="empty">the first note is on its way.</li>'
    page = open(INDEX, encoding="utf-8").read()
    if "<!-- NOTES:START -->" not in page:
        sys.exit("blog/index.html is missing its NOTES markers")
    new = re.sub(r"(<!-- NOTES:START -->\n).*?(\n\s*<!-- NOTES:END -->)",
                 lambda mm: mm.group(1) + listing + mm.group(2), page, flags=re.S)
    if new != page:
        open(INDEX, "w", encoding="utf-8").write(new)
    print(f"{len(rows)} notes on the blog page.")


if __name__ == "__main__":
    main()
