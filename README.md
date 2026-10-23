# personal-website

Source code for my personal website, published at https://shravanlad.com/.

## Technology stack

- Plain HTML, CSS and JavaScript: no framework, package manager, dependencies or build step.
- WebGL 2 for the animated background on the home page (`field.js`).
- Hosted with GitHub Pages, served from the `main` branch.

## Getting started

Prerequisites: Git, a modern browser, and any static file server. The example below uses Python 3.

```sh
git clone https://github.com/shhravan/personal-website.git
cd personal-website
python3 -m http.server 8000
```

Open http://localhost:8000/. Pages use relative links, so the site also works under a sub-path such as GitHub Pages' `/personal-website/`.

There are no build, lint, format or test scripts.

## Configuration

None. No environment variables or secrets are required.

## Project structure

| Path | Purpose |
|---|---|
| `index.html` | Home page |
| `about/`, `work/`, `blog/`, `photography/`, `rabbit-hole/` | Section pages (`index.html` each) |
| `styles.css` | All styles, including light and dark themes |
| `theme.js` | Shared top bar: theme switch, logo, music player (loaded on every page) |
| `script.js`, `field.js` | Home page photo rotation and WebGL background |
| `images/` | Logo and hero photos (`NAME.webp` and `NAME-700.webp` per photo) |
| `docs/` | Product, design, technical, progress and security documentation |

## Maintenance notes

- Every page sets a Content Security Policy in a `<meta>` tag. Adding a new external resource (fonts, scripts, embeds) requires updating that policy on every page. See [docs/SECURITY_RUNBOOK.md](docs/SECURITY_RUNBOOK.md).
- Stylesheet and script links carry a `?v=` query string. Increment it on every page when those files change, so browsers fetch the new version.
- Changes are made on a branch and merged to `main` through a pull request. GitHub Pages redeploys automatically after each merge.

## Security

To report a security issue, contact the repository owner privately rather than opening a public issue. Audit notes are in [docs/SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md).
