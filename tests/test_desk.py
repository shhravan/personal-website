"""Checks on the photography data and the desk (the private dashboard in _desk/).

Run:  python3 -m unittest discover -s tests -v
"""
import json
import os
import re
import shutil
import subprocess
import unittest

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(rel):
    with open(os.path.join(REPO, rel), encoding="utf-8") as f:
        return f.read()


class PhotosData(unittest.TestCase):
    """data/photos.json is written by the desk; the photography page draws its rolls from it."""

    def setUp(self):
        self.data = json.loads(read("data/photos.json"))

    def photos(self):
        for kind in ("gallery", "commercial"):
            for roll in self.data[kind]:
                for p in roll["photos"]:
                    yield roll, p

    def test_shape(self):
        self.assertEqual(self.data["version"], 1)
        ids = [r["id"] for k in ("gallery", "commercial") for r in self.data[k]]
        self.assertEqual(len(ids), len(set(ids)), "two rolls share an id")
        for kind in ("gallery", "commercial"):
            for roll in self.data[kind]:
                self.assertIsInstance(roll["hidden"], bool)
                self.assertIsInstance(roll["name"], str)

    def test_every_photo_has_both_files(self):
        names = []
        for roll, p in self.photos():
            with self.subTest(p["name"]):
                self.assertRegex(p["name"], r"^[a-z0-9][a-z0-9-]{0,59}$")
                self.assertIn(p["dir"], ("images/hero", "images/photos"))
                for suffix in ("", "-700"):
                    self.assertTrue(os.path.exists(os.path.join(REPO, p["dir"], p["name"] + suffix + ".webp")), p["dir"] + "/" + p["name"] + suffix)
                self.assertEqual(len(p["focus"]), 3)
                names.append(p["name"])
        self.assertEqual(len(names), len(set(names)), "the same photo name is used twice")

    def test_no_desk_photo_is_left_unused(self):
        # the desk deletes files no roll uses when it saves; nothing should pile up in images/photos
        folder = os.path.join(REPO, "images", "photos")
        if not os.path.isdir(folder):
            return
        used = {p["name"] for _, p in self.photos() if p["dir"] == "images/photos"}
        for f in os.listdir(folder):
            self.assertIn(re.sub(r"(-700)?\.webp$", "", f), used, f)


class Desk(unittest.TestCase):
    def test_desk_is_not_published_by_github_pages(self):
        # GitHub Pages (Jekyll) skips folders whose names start with "_", so the desk never appears
        # on shravanlad.com. A .nojekyll file would switch that off and publish it.
        self.assertTrue(os.path.isdir(os.path.join(REPO, "_desk")))
        self.assertFalse(os.path.exists(os.path.join(REPO, ".nojekyll")))

    def test_public_pages_never_link_to_the_desk(self):
        for root, _, files in os.walk(REPO):
            if any(part in root for part in ("/.git", "/_desk", "/docs", "/.claude", "/tests")):
                continue
            for f in files:
                if f.endswith((".html", ".js", ".css")):
                    rel = os.path.relpath(os.path.join(root, f), REPO)
                    self.assertNotIn("_desk", read(rel), rel)

    def test_the_server_code(self):
        if not shutil.which("node"):
            self.skipTest("node isn't installed")
        r = subprocess.run(["node", os.path.join(REPO, "tests", "desk_api_test.mjs")], capture_output=True, text=True, timeout=120)
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertNotIn("FAIL", r.stdout)


if __name__ == "__main__":
    unittest.main()
