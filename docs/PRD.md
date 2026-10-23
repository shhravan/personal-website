# PRD: shravan's personal website

## Purpose
One destination to get to know **Shravan Lad**, professionally and personally.

## Audience
Everyone: professionals, creatives, startup people, generalists. A first-time visitor should understand who Shravan is within a few seconds, then be able to go as deep as they like.

## Structure
A simple, link-based site in the style of rishigurjar.com and chinmay.blog. The home page is short; each section is its own page.

| Page | What it is |
|---|---|
| **home** | top bar (light switch, name mark, record player), rotating hero photo, short intro, links, profile icons, Instagram line |
| **projects** | things Shravan is building, as cards (replaces the old about page) |
| **work** | projects, experience, resume download (page layout inspired by hrishabhayush.com) |
| **blog** | most important section. A list of posts (title + date); hovering a title shows a floating image |
| **photography** | a portfolio page, all on one page: a film roll of Shravan's film photos that scrolls like a strip of film, then separate sections (like a portfolio). Instagram: instagram.com/opticsbyshrvn |
| **random rabbit holes** | music (playlists) plus "all things cool": favorite bands, favorite facts, random things Shravan likes. Reached with a special transition (see Later) |

## Core features (v1)
1. **Rotating hero image** on the home page. Cycles through a folder of Shravan's photos and references every 2 seconds in a shuffled order (no repeats until all have shown), each photo framed for the wide shape. Clicking anywhere on the home page also changes the photo. This is the main personality moment.
2. **Link list** on the home page to about, work, blog, photography, rabbit hole.
3. **Blog**: posts are plain files in the repo. List page with hover images; each post is its own page.
4. **Work page**: project cards (title, dates, one-line description, tech tags, links), experience list, resume download.
5. **Photography page**: a "film roll" strip of film photos, plus portfolio sections on the same page. Photos are added by dropping files into a folder (see Open questions for Instagram).
6. **Rabbit hole page**: minimal lists (music picks, favorites, facts).
7. **Dark mode:** a wall light switch in the top-left corner of every page (lever up and "on" for light, down and "off" for dark) that remembers the visitor's choice.
8. **Record player:** a turntable in the top-right corner plays Shravan's song in-page, and keeps playing as you move between pages.
9. **Letter field:** a faint animated field of letters behind every page, with a hover circle and click ripples.
10. **Green accent banner** with flickering grain (inspired by ronaldleung.co) on the work page as a design element.

## Non-goals for v1
- No login, database or accounts (fully static)
- No blog admin panel or comments
- No print sales
- No live Spotify integration (embeds and links only)
- No horizontal-scroll storytelling (the film roll on the photography page is the one exception)
- No automatic Instagram sync in v1

## Later (after v1)
- The black-hole "fall in" transition for the rabbit hole link (inspired by somehowliving.tech; needs original artwork and animation)
- Custom domain `shravanlad.com` (bought on Spaceship, pointed at GitHub Pages)

## Content status
- **Have:** resume, 28 hero photos, intro text, logo, profile links, one song for the record player.
- **Need:** bio and about story, project descriptions, more photos for the hero and gallery, blog posts, favorites lists. Placeholders go in first; Claude helps draft the real text.

## Address
Started at `shhravan.github.io/personal-website`; now lives at `shravanlad.com` (the old address redirects).

## Success looks like
- The site is live and Shravan can explain every file in it.
- A stranger can find who Shravan is, see their work, and read the blog in under a minute.
- It feels like Shravan: simple, personal, tasteful.

## Open questions
- What the about story covers.
- Whether the resume is a PDF linked from work.
- Which posts the blog launches with.
