# TECH RULES

Keep it simple. The goal is a site Shravan can read and explain.

## Stack
- **Plain HTML, CSS and a little JavaScript.** No frameworks, no build step, no npm packages.
  - *HTML* = the content and structure of a page.
  - *CSS* = how it looks.
  - *JavaScript* = small behaviors (rotating hero image, blog hover image, film roll).
- **Hosting:** GitHub Pages (free static hosting straight from the repo). Needs a public repo or a paid plan; decided before the first deploy.
- **Font:** EB Garamond from Google Fonts, loaded with a `<link>` tag.

## Folder layout
```
index.html          home page
about/index.html    each page is a folder with an index.html (clean URLs: /about/)
work/  blog/  photography/  rabbit-hole/
styles.css          one shared stylesheet
script.js           shared small scripts (add page-specific files only if needed)
images/             hero/, film/, blog/, ...
docs/               PRD, DESIGN, TECH_RULES
```

## Rules
1. One slice per branch and PR; each page works on its own when you open it.
2. Use **relative links** (`./about/`, not `/about/`) so the site works at `shhravan.github.io/personal-website/` and later at `shravanlad.com`.
3. Mobile first: every page must look right on a phone.
4. Images: compress before adding (about 200-400 KB max each). Always add `alt` text (a short description for screen readers).
5. Blog posts are plain `.html` files in `blog/`, listed on the blog page by hand (no database or CMS).
6. No secrets in the repo, ever (no API keys or tokens).
7. Comments in code explain *why*, in plain English, since Shravan is learning.
8. Check each page in a browser before opening a PR (screenshot from the cloud container, plus the live GitHub Pages link once deployed).

## Later
- A script or GitHub Action to build the film roll from the contents of `images/film/`.
- Custom domain `shravanlad.com` via Namecheap DNS pointing at GitHub Pages.
