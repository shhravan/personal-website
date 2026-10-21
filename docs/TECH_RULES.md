# TECH RULES

Keep it simple. The goal is a site Shravan can read and explain.

## Stack
- **Plain HTML, CSS and a little JavaScript** for all pages. No frameworks, no npm packages.
  - *HTML* = the content and structure of a page.
  - *CSS* = how it looks (including the animated green grain banner).
  - *JavaScript* = small behaviors (rotating hero image, blog hover image, film roll motion).
- **One small Python sync script** (`scripts/substack_sync.py`, standard library only), run by a GitHub Action once a month (and on demand):
  - copies Shravan's free Substack posts (shrvvn.substack.com) into blog pages and the blog list
  - Substack's unofficial JSON API first, the official RSS feed as fallback; HTML cleaned to an allowlist; images downloaded into `images/blog/`
  - Substack's Cloudflare protection blocks GitHub's machines, so in the Action all requests go through a Cloudflare Worker relay (`worker/feed-relay.js`): fixed allowlist of Substack addresses, secret key in `X-Relay-Key` (GitHub secret `SUBSTACK_RELAY_KEY`, Worker secret `RELAY_KEY`), Worker address in the GitHub variable `SUBSTACK_RELAY_URL`
  - turns the `images/film/` folder into the film roll's photo list
  - *Markdown* = plain-text writing with simple marks (`# heading`, `**bold**`).
  - *GitHub Action* = a small robot on GitHub that runs a script whenever you push.
  - Only standard Python plus at most one small Markdown library.
- **Hosting:** GitHub Pages (free static hosting straight from the repo). Needs a public repo or a paid plan; decided before the first deploy.
- **Font:** EB Garamond from Google Fonts, loaded with a `<link>` tag.

## Folder layout
```
index.html          home page
about/index.html    each page is a folder with an index.html (clean URLs: /about/)
work/  blog/  photography/  rabbit-hole/
styles.css          one shared stylesheet
script.js           page scripts (hero rotation, email links); loaded on every page, sets up again on each page swap
field.js            the letter field behind every page (WebGL)
theme.js            light/dark mode, light switch, record player, and in-place page swaps so music keeps playing; in the <head> of every page
images/             hero/, film/, blog/, ...
images/logo.png     name mark (mask)
docs/               PRD, DESIGN, TECH_RULES, todo, LEARNING, SECURITY_*
```

## Rules
1. One slice per branch and PR; each page works on its own when you open it.
2. Use **relative links** (`./about/`, not `/about/`) so the site works at `shhravan.github.io/personal-website/` and later at `shravanlad.com`.
3. Mobile first: every page must look right on a phone.
4. Images: compress before adding (about 200-400 KB max each). Always add `alt` text (a short description for screen readers). Hero photos: two WebP files per photo, NAME.webp (1200px wide) and NAME-700.webp (phones); the frame crops from the center to a 1.9:1 shape (4:3 on phones), so keep the subject near the middle, or set its framing in the `FOCUS` list in `script.js` (focal point and zoom).
5. Blog posts are written on Substack. The sync script makes `blog/<slug>/index.html` and the list between the POSTS markers in `blog/index.html`; never edit those by hand. Each post page has a canonical link to Substack.
6. No secrets in the repo, ever (no API keys or tokens). Future tokens go in GitHub Actions secrets.
6b. Every page carries the Content-Security-Policy meta tag; a new outside service must be added to it on every page (see docs/SECURITY_RUNBOOK.md).
6c. When CSS or JS changes, bump the `?v=` number on its links in every page so browsers fetch the new file.
6d. Keep the docs current: any PR that changes behavior or design updates PRD/DESIGN/TECH_RULES/todo and adds a LEARNING.md note.
6e. Every page copies the home page head and body skeleton: `<a class="logo">`, `<main class="col ...">`, the `.foot` line, and field.js + script.js at the end. Page swaps (theme.js) replace only `.logo` and `<main>`, so anything a page needs must live inside `<main>`; page code sets itself up again on the `page:load` event.
6f. Tests live in `tests/` (standard library `unittest`, no network). Run `python3 -m unittest discover -s tests -v` before a PR; GitHub runs them on every push (`.github/workflows/tests.yml`) and the Substack sync refuses to publish if they fail.
7. Comments in code explain *why*, in plain English, since Shravan is learning.
8. Check each page in a browser before opening a PR (screenshot from the cloud container, plus the live GitHub Pages link once deployed).

## Later
- Official Instagram API sync (needs a Creator account; run by the same GitHub Action).
- Custom domain `shravanlad.com` via Namecheap DNS pointing at GitHub Pages.
