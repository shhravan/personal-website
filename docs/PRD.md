# Product requirements

## Purpose
A single place to get to know Shravan Lad, professionally and personally.

## Audience
Recruiters, founders, collaborators and anyone curious. A first-time visitor should understand who Shravan is within a few seconds, then be able to go as deep as they like.

## Structure
A short home page that links out; each section is its own page.

| Page | Contents |
|---|---|
| **home** | top bar (theme switch, name mark, record player), rotating hero photo, short intro, section links, profile icons, Instagram line |
| **work** | about, work experience, education, honors, and a "get in touch" banner |
| **projects** | things Shravan is building, as cards |
| **blog** | posts synced from Substack: a list of titles and dates, one page per post |
| **photography** | a film-roll strip of film photos, then portfolio sections |
| **random rabbit holes** | music and favorites: bands, playlists, facts |

## Core features
1. **Rotating hero image** on the home page: shuffled, no repeats until every photo has shown, each framed by hand; clicking the page skips to the next.
2. **Dark mode** via a light switch in the top-left corner, remembered per visitor (dark by default).
3. **Record player** in the top-right corner. On desktop it opens a dial of 15 album covers; music keeps playing across page changes.
4. **Letter field** and shoreline animation behind every page.
5. **Blog sync** from Substack, run automatically by GitHub Actions.
6. Every page works on a phone and respects reduced-motion settings.

## Non-goals
- Login, database, accounts or forms (the site is fully static)
- Blog admin or comments
- Print sales
- Live Spotify integration

## Later
- Photography page (film roll and portfolio sections)
- Rabbit hole content
- Blog hover images
- A transition effect into the rabbit hole page

## Hosting
GitHub Pages at `shravanlad.com` (DNS at Spaceship). The old `shhravan.github.io/personal-website` address redirects there.

## Success looks like
- A stranger can find who Shravan is, see their work and read the blog in under a minute.
- It feels personal, simple and tasteful.
- Shravan can explain every file in it.
