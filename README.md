# shravanlad.com

The personal website of Shravan Lad: work, writing, photography and the things I'm into.

**Live at [shravanlad.com](https://shravanlad.com)**

Hand-built in plain HTML, CSS and JavaScript, with no framework, no dependencies and no build step. Every page is a static file served by GitHub Pages.

## Features

- **Record player.** A turntable in the corner opens into a dial of 15 album covers on desktop. Songs shuffle, and the music keeps playing as you move between pages.
- **Letter field.** A faint WebGL field of letters behind every page that reacts to the cursor and clicks, with a shoreline washing in at the bottom.
- **Light switch.** A drawn wall switch toggles light and dark mode and remembers your choice.
- **Blog synced from Substack.** A scheduled GitHub Action copies posts into the site, cleans their HTML and hosts the images locally.
- **Fast and private.** No analytics, no cookies, a strict Content Security Policy, and it works on phones and with reduced motion.

## Run locally

```sh
git clone https://github.com/shhravan/personal-website.git
cd personal-website
python3 -m http.server 8000
```

Open http://localhost:8000.

## Tests

```sh
python3 -m unittest discover -s tests -v
```

The suite covers the site (security policy, links, inline code), the Substack sync (hostile HTML, broken feeds, rate limits) and the Cloudflare relay. It needs only Python's standard library, plus Node for the relay test, never touches the network, and runs on every push.

## Project structure

```
index.html                 home
work/  projects/  blog/  photography/  rabbit-hole/
styles.css                 all styles, light and dark
theme.js                   light switch, record player, page navigation
script.js                  hero photos, email link
field.js                   WebGL letter field and shoreline
images/                    photos, album covers, logos
scripts/substack_sync.py   blog sync (runs monthly via GitHub Actions)
worker/feed-relay.js       Cloudflare Worker used by the sync
tests/                     automated tests
docs/                      design, product, technical and security notes
```

The design is documented in [docs/DESIGN.md](docs/DESIGN.md).

## Security

Please report security issues privately to the repository owner rather than opening a public issue.
