# shravan lad — personal website

**Live:** https://shhravan.github.io/personal-website/ (later `shravanlad.com`)

One place to get to know Shravan Lad: work, writing, photography and things he likes. A deliberately simple static site with a few handmade details, built as a first coding project with Claude Code.

## What's on the home page
- **Top bar** (fixed, zoom-proof): a wall **light switch** for light/dark mode, the **श्रवण लाड / SHRAVAN LAD** name mark, and a **turntable**: click it, the needle drops, and a song plays.
- **Hero photo** that swaps every 0.4–1 s in a shuffled order; click anywhere to skip.
- **Letter field**: a faint WebGL field of English and Devanagari letters behind the page, with a dissolving hover circle, click ripples, and lacy foam washing in along the bottom.
- Intro, section links (about, work, blog, photography, rabbit hole) and profile icons.

## Stack
Plain **HTML, CSS and JavaScript**: no framework, no packages, no build step. Hosted on **GitHub Pages** from `main`. Fonts from Google Fonts (EB Garamond, Noto Serif Devanagari, Silkscreen); the record player uses YouTube's embeddable player.

```
index.html            home page
about/ work/ blog/ photography/ rabbit-hole/   section pages (stubs for now)
styles.css            all styles (light + dark tokens)
theme.js              light switch, turntable, top bar (every page)
script.js             hero photo rotation, email links (home)
field.js              WebGL letter field and shore (home)
images/hero/          hero photos (NAME.webp + NAME-700.webp)
images/logo.png       name mark
docs/                 product, design, tech, progress, learning and security docs
```

## Docs
| File | What it covers |
|---|---|
| [docs/PRD.md](docs/PRD.md) | purpose, audience, pages, features, non-goals |
| [docs/DESIGN.md](docs/DESIGN.md) | look and feel, page by page |
| [docs/TECH_RULES.md](docs/TECH_RULES.md) | technical rules and folder layout |
| [docs/todo.md](docs/todo.md) | slices done and next |
| [docs/LEARNING.md](docs/LEARNING.md) | plain-English notes on what each change taught |
| [docs/SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md) | security findings and fixes |
| [docs/SECURITY_CHECKLIST.md](docs/SECURITY_CHECKLIST.md) | control-by-control status |
| [docs/SECURITY_REMEDIATION_LOG.md](docs/SECURITY_REMEDIATION_LOG.md) | what changed for security and how it was tested |
| [docs/SECURITY_RUNBOOK.md](docs/SECURITY_RUNBOOK.md) | rollback, incident and credential steps |
| [CLAUDE.md](CLAUDE.md) | working agreement for the AI assistant |

## Run it locally
Any static server works:
```
python3 -m http.server 8000
# open http://localhost:8000/
```

## How changes ship
Each change is a small branch → pull request → merge to `main`; GitHub Pages redeploys in about a minute. Every PR that changes behavior or design also updates the docs above. To undo a change, revert its PR on GitHub.

## Credits
Icons: [Simple Icons](https://simpleicons.org) (CC0). Letter-field idea inspired by contentarchitecture.dev; layout ideas from rishigurjar.com and chinmay.blog. All code written from scratch for this site. Hero images include third-party artwork and stills used as personal references.
