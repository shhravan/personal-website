# shravanlad.com

Source for [shravanlad.com](https://shravanlad.com), the personal website of Shravan Lad.

A static site in plain HTML, CSS and JavaScript (no framework or build step), hosted on GitHub Pages. Highlights: a WebGL letter-field background, a record player with an album-cover dial, music that keeps playing across pages, and a blog synced automatically from Substack.

## Run locally

```sh
git clone https://github.com/shhravan/personal-website.git
cd personal-website
python3 -m http.server 8000
```

Then open http://localhost:8000/.

## Tests

```sh
python3 -m unittest discover -s tests -v
```

Tests use only the Python standard library (plus Node for the relay test) and never touch the network. They run on every push.

## Structure

| Path | Purpose |
|---|---|
| `index.html`, `work/`, `projects/`, `blog/`, `photography/`, `rabbit-hole/` | Pages |
| `styles.css` | All styles, light and dark |
| `theme.js` | Theme switch, record player, in-place page navigation |
| `script.js`, `field.js` | Hero rotation and email link; WebGL background |
| `scripts/substack_sync.py` | Blog sync from Substack (runs monthly via GitHub Actions) |
| `worker/feed-relay.js` | Cloudflare Worker relay used by the sync |
| `tests/` | Automated tests |
| `docs/` | Product, design, technical and security notes |

## Security

Please report security issues privately to the repository owner rather than opening a public issue.
