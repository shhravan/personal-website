import os, sys, unittest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
import build_notes as b


class Notes(unittest.TestCase):
    def test_links_and_escaping(self):
        out = b.render_note("2026-11-05-hi.md", "# hello\n\nsee my [work](/work/) and [x](https://x.com/shrvvn).\n\n<script>bad</script> [no](javascript:alert(1)) *it* **bo**")
        self.assertIn('<a href="/work/">work</a>', out)
        self.assertIn('href="https://x.com/shrvvn" target="_blank"', out)
        self.assertIn("&lt;script&gt;", out)
        self.assertNotIn("javascript:", out)
        self.assertIn("<em>it</em>", out)
        self.assertIn("<strong>bo</strong>", out)
        self.assertIn("<h3>hello</h3>", out)
        self.assertIn("5 nov 2026", out)


if __name__ == "__main__":
    unittest.main()
