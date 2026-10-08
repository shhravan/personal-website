# TECH RULES

Keep it simple. The goal is a site Shravan can read and explain.

## Stack
- **Plain HTML, CSS and a little JavaScript** for all pages. No frameworks, no npm packages.
  - *HTML* = the content and structure of a page.
  - *CSS* = how it looks (including the animated green grain banner).
  - *JavaScript* = small behaviors (rotating hero image, blog hover image, film roll motion).
- **One small Python build script** (added at the blog slice), run automatically by a GitHub Action on every push:
  - turns Markdown blog posts (`posts/*.md`) into blog pages and the blog list
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
script.js           home page scripts (hero rotation, email links)
theme.js            light/dark mode and the light switch drawing, loaded in the <head> of every page
images/             hero/, film/, blog/, ...
docs/               PRD, DESIGN, TECH_RULES
```

## Rules
1. One slice per branch and PR; each page works on its own when you open it.
2. Use **relative links** (`./about/`, not `/about/`) so the site works at `shhravan.github.io/personal-website/` and later at `shravanlad.com`.
3. Mobile first: every page must look right on a phone.
4. Images: compress before adding (about 200-400 KB max each). Always add `alt` text (a short description for screen readers). Hero photos: landscape JPGs at least 1200px wide and under 300 KB; the frame crops from the center to a 1.9:1 shape (4:3 on phones), so keep the subject near the middle, or set its framing in the `FOCUS` list in `script.js` (focal point and zoom).
5. Blog posts are Markdown files in `posts/`. The build script makes the pages and the list (no database or CMS). Until the blog slice, pages are hand-written HTML.
6. No secrets in the repo, ever (no API keys or tokens).
7. Comments in code explain *why*, in plain English, since Shravan is learning.
8. Check each page in a browser before opening a PR (screenshot from the cloud container, plus the live GitHub Pages link once deployed).

## Later
- Official Instagram API sync (needs a Creator account; run by the same GitHub Action).
- Custom domain `shravanlad.com` via Namecheap DNS pointing at GitHub Pages.
