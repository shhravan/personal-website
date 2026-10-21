"""Runs tests/worker_check.mjs (the Cloudflare Worker relay's checks) with Node, if Node is installed."""
import os
import shutil
import subprocess
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))


@unittest.skipIf(shutil.which("node") is None, "node not installed")
class WorkerTests(unittest.TestCase):
    def test_relay_refuses_everything_off_its_allowlist(self):
        r = subprocess.run(["node", os.path.join(HERE, "worker_check.mjs")], capture_output=True, text=True, timeout=60)
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
