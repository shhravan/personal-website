"""Reliability tests for the Substack sync: the ways the GitHub run has actually failed, and the
ones it could fail next.

Run:  python3 -m unittest discover -s tests -v

History this guards against:
  run 2  - commit step crashed: `git add images/blog` on a folder that didn't exist yet
  run 4/5 - Substack answered 429 "Too Many Requests" on both the API and RSS, and the run gave up
Next likely: someone merges to main while the sync runs, so its `git push` is rejected.

Nothing here touches the network. Git tests use throwaway local repos.
"""
import email.message
import importlib.util
import io
import os
import re
import shutil
import subprocess
import tempfile
import unittest
import urllib.error
from contextlib import redirect_stderr, redirect_stdout

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
spec = importlib.util.spec_from_file_location("sync_rel", os.path.join(REPO, "scripts", "substack_sync.py"))
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)

WORKFLOW = os.path.join(REPO, ".github", "workflows", "substack.yml")
BASE = "https://example.substack.com"
RSS = (b'<?xml version="1.0"?><rss xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel>'
       b'<item><title>T</title><link>https://example.substack.com/p/t</link>'
       b'<pubDate>Tue, 20 Oct 2026 10:00:00 GMT</pubDate><description>s</description>'
       b'<content:encoded><![CDATA[<p>b</p>]]></content:encoded></item></channel></rss>')


def http_error(url, code, retry_after=None):
    headers = email.message.Message()
    if retry_after is not None:
        headers["Retry-After"] = retry_after
    return urllib.error.HTTPError(url, code, "x", headers, None)


class FakeNet(unittest.TestCase):
    """Replaces urlopen, so the real get() (with its retry logic) runs against scripted answers.
    `script` maps a URL substring to a list of answers: bytes, or an HTTP status code to fail with."""

    def setUp(self):
        self.saved = (sync.urllib.request.urlopen, sync.time.sleep, sync.RELAY, sync.RELAY_KEY)
        self.waits, self.calls, self.script = [], [], {}
        sync.time.sleep = self.waits.append
        sync.RELAY = sync.RELAY_KEY = ""

        def urlopen(req, timeout=None):
            self.calls.append(req.full_url)
            for key, answers in self.script.items():
                if key in req.full_url:
                    a = answers.pop(0) if len(answers) > 1 else answers[0]
                    if isinstance(a, int):
                        raise http_error(req.full_url, a, self.retry_after)
                    return io.BytesIO(a)
            raise http_error(req.full_url, 404)
        self.retry_after = None
        sync.urllib.request.urlopen = urlopen

    def tearDown(self):
        sync.urllib.request.urlopen, sync.time.sleep, sync.RELAY, sync.RELAY_KEY = self.saved


class RateLimitTests(FakeNet):
    def test_retry_after_header_is_obeyed(self):
        self.retry_after = "7"
        self.script = {"/feed": [429, RSS]}
        sync.get(f"{BASE}/feed")
        self.assertEqual(self.waits, [7])

    def test_huge_retry_after_is_capped(self):
        # a hostile or buggy server can't park the job for a day
        self.retry_after = "86400"
        self.script = {"/feed": [429, RSS]}
        sync.get(f"{BASE}/feed")
        self.assertLessEqual(max(self.waits), 120)

    def test_garbage_retry_after_falls_back_to_default(self):
        for junk in ("soon", "-5", "1e9", "Wed, 21 Oct 2026 07:28:00 GMT", ""):
            with self.subTest(junk):
                self.waits.clear()
                self.retry_after = junk
                self.script = {"/feed": [429, RSS]}
                sync.get(f"{BASE}/feed")
                self.assertEqual(self.waits, [sync.RETRY_WAITS[0]])

    def test_503_is_retried_too(self):
        self.script = {"/feed": [503, 503, RSS]}
        self.assertEqual(sync.get(f"{BASE}/feed"), RSS)

    def test_relay_mode_retries(self):
        sync.RELAY, sync.RELAY_KEY = "https://relay.example.workers.dev", "k"
        self.script = {"relay.example": [429, RSS]}
        self.assertEqual(sync.get(f"{BASE}/feed"), RSS)
        self.assertEqual(len(self.calls), 2)

    def test_worst_case_wait_fits_inside_job_timeout(self):
        # every request maxing out its retries must still finish well within the workflow's timeout
        with open(WORKFLOW, encoding="utf-8") as f:
            minutes = int(re.search(r"timeout-minutes:\s*(\d+)", f.read()).group(1))
        worst_one_request = len(sync.RETRY_WAITS) * 120
        self.assertLess(worst_one_request * 3, minutes * 60)   # archive + rss + one post, all at worst

    def test_api_rate_limited_falls_back_to_rss(self):
        self.script = {"/api/v1/": [429], "/feed": [RSS]}
        err = io.StringIO()
        with redirect_stderr(err):
            posts, via = sync.fetch(BASE)
        self.assertEqual(via, "rss")
        self.assertEqual(posts[0]["title"], "T")

    def test_both_routes_rate_limited_fail_cleanly(self):
        # the run should go red with one readable line, not a 40-line traceback
        self.script = {"/api/v1/": [429], "/feed": [429]}
        with redirect_stderr(io.StringIO()), self.assertRaises(SystemExit) as cm:
            sync.fetch(BASE)
        self.assertIn("Substack unreachable", str(cm.exception))
        self.assertIn("429", str(cm.exception))

    def test_rate_limit_that_clears_still_succeeds_end_to_end(self):
        # what the green run 6 looked like: a couple of 429s, then answers
        self.script = {"/api/v1/": [429, 429, 429, 429], "/feed": [429, RSS]}
        with redirect_stderr(io.StringIO()):
            posts, via = sync.fetch(BASE)
        self.assertEqual((len(posts), via), (1, "rss"))


class ScheduleTests(unittest.TestCase):
    """The monthly schedule must survive GitHub's 60-day shutoff of idle scheduled workflows."""

    def setUp(self):
        with open(WORKFLOW, encoding="utf-8") as f:
            self.src = f.read()

    def test_keepalive_step_exists_and_cannot_break_the_job(self):
        step = self.src[self.src.index("Keep the monthly schedule switched on"):]
        self.assertIn("if: always()", step)
        self.assertIn("continue-on-error: true", step)
        self.assertIn("/actions/workflows/substack.yml/enable", step)
        self.assertRegex(self.src, r"(?m)^  actions: write")

    def test_actions_are_current_majors(self):
        # v4 checkout / v5 setup-python run on Node 20, which GitHub is retiring
        for use in re.findall(r"uses:\s*actions/([\w-]+)@v(\d+)", self.src):
            self.assertGreaterEqual(int(use[1]), 6, use)


class LimitTests(FakeNet):
    """--limit N keeps a test run against a big publication short."""

    def test_api_stops_after_limit(self):
        import json as _json
        archive = _json.dumps([{"slug": f"p{i}", "post_date": "2020-01-01", "type": "newsletter"} for i in range(25)]).encode()
        post = _json.dumps({"title": "T", "body_html": "<p>b</p>", "post_date": "2020-01-01"}).encode()
        self.script = {"/api/v1/archive": [archive], "/api/v1/posts/": [post]}
        sync.LIMIT = 3
        try:
            posts = sync.fetch_from_api(BASE)
        finally:
            sync.LIMIT = 0
        self.assertEqual(len(posts), 3)
        self.assertEqual(sum("/api/v1/posts/" in c for c in self.calls), 3)

    def test_rss_respects_limit(self):
        many = RSS.replace(b"</channel>", RSS[RSS.index(b"<item>"):RSS.index(b"</item>") + 7] * 5 + b"</channel>")
        self.script = {"/feed": [many]}
        sync.LIMIT = 2
        try:
            self.assertEqual(len(sync.fetch_from_rss(BASE)), 2)
        finally:
            sync.LIMIT = 0


def commit_step():
    """The exact shell script of the workflow's commit step."""
    with open(WORKFLOW, encoding="utf-8") as f:
        src = f.read()
    m = re.search(r"- name: Commit if anything changed\n\s+run: \|\n((?:\s{10}.*\n?)+)", src)
    return "\n".join(line[10:] for line in m.group(1).splitlines())


@unittest.skipUnless(shutil.which("git"), "git not installed")
class CommitStepTests(unittest.TestCase):
    """Runs the workflow's real commit step in throwaway repos."""

    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.remote = os.path.join(self.tmp, "remote.git")
        self.work = os.path.join(self.tmp, "work")
        self.env = {**os.environ, "GITHUB_REF_NAME": "main", "GIT_AUTHOR_NAME": "t", "GIT_AUTHOR_EMAIL": "t@t",
                    "GIT_COMMITTER_NAME": "t", "GIT_COMMITTER_EMAIL": "t@t", "HOME": self.tmp}
        self.git("init", "-q", "--bare", "-b", "main", self.remote, cwd=self.tmp)
        self.git("clone", "-q", self.remote, self.work, cwd=self.tmp)
        os.makedirs(os.path.join(self.work, "blog"))
        self.write("blog/index.html", "list")
        self.git("add", ".")
        self.git("commit", "-qm", "init")
        self.git("push", "-q", "origin", "HEAD:main")

    def tearDown(self):
        shutil.rmtree(self.tmp)

    def git(self, *args, cwd=None):
        return subprocess.run(["git", *args], cwd=cwd or self.work, env=self.env, check=True,
                              capture_output=True, text=True).stdout

    def write(self, rel, text):
        path = os.path.join(self.work, rel)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            f.write(text)

    def run_step(self):
        return subprocess.run(["bash", "-e", "-c", commit_step()], cwd=self.work, env=self.env,
                              capture_output=True, text=True)

    def remote_log(self):
        return self.git("log", "--format=%s", "main", cwd=self.remote)

    def test_nothing_new_and_no_images_folder(self):
        # run 2's crash: images/blog didn't exist
        r = self.run_step()
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn("No new or changed posts", r.stdout)

    def test_new_post_without_images_is_pushed(self):
        self.write("blog/hello/index.html", "post")
        r = self.run_step()
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn("Blog: sync posts from Substack", self.remote_log())

    def test_new_post_with_images_is_pushed(self):
        self.write("blog/hello/index.html", "post")
        self.write("images/blog/hello/abc.png", "png")
        r = self.run_step()
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn("images/blog/hello/abc.png", self.git("ls-tree", "-r", "--name-only", "main", cwd=self.remote))

    def test_main_moved_while_sync_ran(self):
        # someone merges a PR during the run: the push must still land, keeping both commits
        other = os.path.join(self.tmp, "other")
        self.git("clone", "-q", self.remote, other, cwd=self.tmp)
        with open(os.path.join(other, "README.md"), "w") as f:
            f.write("x")
        self.git("add", ".", cwd=other)
        self.git("commit", "-qm", "someone else's merge", cwd=other)
        self.git("push", "-q", "origin", "HEAD:main", cwd=other)
        self.write("blog/hello/index.html", "post")
        r = self.run_step()
        self.assertEqual(r.returncode, 0, r.stderr)
        log = self.remote_log()
        self.assertIn("someone else's merge", log)
        self.assertIn("Blog: sync posts from Substack", log)


if __name__ == "__main__":
    unittest.main()
