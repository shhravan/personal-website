import os, sys, unittest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
import build_notes as b


class Notes(unittest.TestCase):
    def test_links_and_escaping(self):
        title, date, out = b.render_note("2026-11-05-hi.md", "# hello\n\nsee my [work](/work/) and [x](https://x.com/shrvvn).\n\n<script>bad</script> [no](javascript:alert(1)) *it* **bo**")
        self.assertIn('<a href="/work/">work</a>', out)
        self.assertIn('href="https://x.com/shrvvn" target="_blank"', out)
        self.assertIn("&lt;script&gt;", out)
        self.assertNotIn("javascript:", out)
        self.assertIn("<em>it</em>", out)
        self.assertIn("<strong>bo</strong>", out)
        self.assertEqual(title, "hello")
        self.assertEqual(date, "nov 5, 2026")
        _, _, pic = b.render_note("2026-11-05-p.md", "![a cap](/images/x.jpg)\n\nhi")
        self.assertIn('<img src="/images/x.jpg" alt="a cap">', pic)


if __name__ == "__main__":
    unittest.main()
