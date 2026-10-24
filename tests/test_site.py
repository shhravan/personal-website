"""Checks on what anyone can see by opening the site's source in a browser ("view source" / dev tools).

Run:  python3 -m unittest discover -s tests -v

The site is static, so there is no server to break into; the risks are things a visitor's browser
would run or follow. These tests read every page and script in the repo and fail if any of them
could be turned against a visitor, or if anything secret is lying around.
"""
import glob
import os
import re
import subprocess
import unittest
from html.parser import HTMLParser

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def tracked_files():
    out = subprocess.run(["git", "ls-files"], cwd=REPO, capture_output=True, text=True).stdout.split()
    return [f for f in out if os.path.exists(os.path.join(REPO, f))]


def read(rel):
    with open(os.path.join(REPO, rel), encoding="utf-8", errors="replace") as f:
        return f.read()


PAGES = sorted(f for f in tracked_files() if f.endswith(".html") and not f.startswith("docs/"))
SCRIPTS = sorted(f for f in tracked_files() if f.endswith(".js") and not f.startswith("tests/"))


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.tags, self.inline_scripts, self.csp, self._in_script = [], [], None, False
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.tags.append((tag, attrs))
        if tag == "meta" and (a.get("http-equiv") or "").lower() == "content-security-policy":
            self.csp = a.get("content", "")
        self._in_script = tag == "script" and "src" not in a

    def handle_data(self, data):
        if self._in_script and data.strip():
            self.inline_scripts.append(data)

    def handle_endtag(self, tag):
        if tag == "script":
            self._in_script = False


def csp_directives(csp):
    return {d.split()[0]: d.split()[1:] for d in (x.strip() for x in csp.split(";")) if d}


class PageTests(unittest.TestCase):
    def test_there_are_pages(self):
        self.assertIn("index.html", PAGES)
        self.assertGreater(len(PAGES), 5)

    def test_every_page_has_a_strict_content_security_policy(self):
        for f in PAGES:
            with self.subTest(f):
                p = Page(read(f))
                self.assertTrue(p.csp, "missing CSP meta tag")
                d = csp_directives(p.csp)
                for key in ("default-src", "script-src", "object-src", "base-uri", "form-action"):
                    self.assertIn(key, d)
                for key, values in d.items():
                    for bad in ("'unsafe-inline'", "'unsafe-eval'", "*", "data:", "http:"):
                        if key in ("img-src",) and bad == "data:":
                            continue   # data: images are harmless (used for the favicon)
                        self.assertNotIn(bad, values, f"{key} allows {bad}")
                self.assertEqual(d["object-src"], ["'none'"])
                self.assertEqual(d["form-action"], ["'none'"])
                self.assertEqual(d["base-uri"], ["'self'"])

    def test_no_inline_code_or_styles(self):
        for f in PAGES:
            with self.subTest(f):
                p = Page(read(f))
                self.assertEqual(p.inline_scripts, [], "inline <script> (the CSP would block it anyway)")
                for tag, attrs in p.tags:
                    for k, v in attrs:
                        self.assertFalse(k.startswith("on"), f"<{tag} {k}>")
                        self.assertNotEqual(k, "style", f"<{tag} style>")
                        if k in ("href", "src", "action", "formaction"):
                            self.assertNotRegex((v or "").strip().lower(), r"^(javascript|vbscript|data:text)", f"<{tag} {k}={v}>")

    def test_new_tab_links_cannot_control_this_tab(self):
        for f in PAGES:
            with self.subTest(f):
                for tag, attrs in Page(read(f)).tags:
                    a = dict(attrs)
                    if tag == "a" and a.get("target") == "_blank":
                        self.assertIn("noopener", (a.get("rel") or ""), a.get("href"))

    def test_only_https_resources(self):
        for f in PAGES:
            with self.subTest(f):
                for tag, attrs in Page(read(f)).tags:
                    for k, v in attrs:
                        if k in ("src", "href") and v and v.startswith("http:"):
                            self.fail(f"plain http: {v}")

    def test_email_is_not_written_out_whole(self):
        for f in PAGES:
            with self.subTest(f):
                self.assertNotRegex(read(f), r"[\w.+-]+@[\w-]+\.[a-z]{2,}", "a complete email address bots can harvest")


class ScriptTests(unittest.TestCase):
    def test_no_dynamic_code_execution(self):
        for f in SCRIPTS:
            with self.subTest(f):
                src = read(f)
                self.assertNotRegex(src, r"\beval\s*\(")
                self.assertNotRegex(src, r"new\s+Function\s*\(")
                self.assertNotRegex(src, r"document\.write")
                self.assertNotRegex(src, r"set(Timeout|Interval)\s*\(\s*['\"`]")

    def test_nothing_from_the_address_bar_reaches_the_page_as_html(self):
        # URL pieces (?query, #hash, referrer) are attacker-controlled; they must never be written as HTML.
        for f in SCRIPTS:
            with self.subTest(f):
                for line in read(f).splitlines():
                    if "innerHTML" in line or "outerHTML" in line or "insertAdjacentHTML" in line:
                        self.assertNotRegex(line, r"location\.(hash|search|href)|document\.referrer|URLSearchParams|postMessage", line.strip())

    def test_page_swaps_only_fetch_our_own_pages(self):
        src = read("theme.js")
        self.assertIn("a.origin !== location.origin", src)   # other sites' links load normally
        self.assertNotRegex(src, r"fetch\([^)]*https?://")

    def test_saved_theme_is_whitelisted(self):
        src = read("theme.js")
        self.assertRegex(src, r'saved === "light" \? "light" : "dark"')   # localStorage can't inject anything

    def test_every_song_has_its_audio_file_and_cover(self):
        src = read("theme.js")
        tracks = re.findall(r'\{ start: (\d+), title: "[^"]+", artist: "[^"]+", cover: "([\w-]+)"(?:, file: "([\w-]+)")?', src)
        self.assertEqual(len(tracks), 15)
        for start, cover, file in tracks:
            with self.subTest(cover):
                self.assertTrue(os.path.isfile(os.path.join(REPO, "images", "covers", cover + ".webp")))
                self.assertTrue(os.path.isfile(os.path.join(REPO, "audio", (file or cover) + ".mp3")))
        used = {(f or c) + ".mp3" for _, c, f in tracks}
        on_disk = {f for f in os.listdir(os.path.join(REPO, "audio")) if f.endswith(".mp3")}
        self.assertEqual(on_disk, used, "audio files not used by any song, or songs without a file")

    def test_no_youtube_left(self):
        for f in glob.glob(os.path.join(REPO, "**", "*.html"), recursive=True) + [os.path.join(REPO, "theme.js")]:
            with self.subTest(os.path.relpath(f, REPO)):
                with open(f, encoding="utf-8") as fh:
                    src = fh.read()
                self.assertNotRegex(src, r"youtube\.com/(iframe_api|embed)|ytimg|frame-src")


class RepoTests(unittest.TestCase):
    SECRET_PATTERNS = {
        "GitHub token": r"gh[pousr]_[A-Za-z0-9]{30,}",
        "OpenAI/Anthropic-style key": r"\bsk-(ant-)?[A-Za-z0-9_-]{20,}",
        "AWS key": r"\bAKIA[0-9A-Z]{16}\b",
        "Google API key": r"\bAIza[0-9A-Za-z_-]{35}\b",
        "Slack token": r"\bxox[abprs]-[A-Za-z0-9-]{10,}",
        "private key": r"-----BEGIN [A-Z ]*PRIVATE KEY-----",
        "Instagram/Facebook token": r"\bIG[A-Za-z0-9]{100,}|\bEAA[A-Za-z0-9]{100,}",
    }

    def test_no_secrets_in_the_repo(self):
        for f in tracked_files():
            if f.endswith((".png", ".jpg", ".webp", ".gif", ".svg", ".ico")) or f.startswith("tests/"):
                continue
            text = read(f)
            for name, pat in self.SECRET_PATTERNS.items():
                with self.subTest(file=f, kind=name):
                    self.assertNotRegex(text, pat)

    def test_no_env_files_committed(self):
        for f in tracked_files():
            self.assertFalse(re.search(r"(^|/)\.env(\.|$)|id_rsa|\.pem$|\.key$", f), f)

    def test_workflows_are_locked_down(self):
        for f in glob.glob(os.path.join(REPO, ".github", "workflows", "*.y*ml")):
            with open(f, encoding="utf-8") as fh:
                src = fh.read()
            with self.subTest(os.path.basename(f)):
                self.assertRegex(src, r"(?m)^permissions:", "permissions must be stated, not inherited")
                self.assertNotIn("pull_request_target", src)                       # runs untrusted PR code with secrets
                self.assertNotRegex(src, r"\$\{\{\s*github\.event\.[^}]*(title|body|head_ref|message|name)")  # script injection
                self.assertNotRegex(src, r"write-all")
                for use in re.findall(r"uses:\s*(\S+)", src):
                    self.assertRegex(use, r"^actions/[\w-]+@v\d+$", f"third-party or unpinned action: {use}")


if __name__ == "__main__":
    unittest.main()
