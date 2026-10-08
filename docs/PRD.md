# PRD: shravan's personal website

## Purpose
One destination to get to know **Shravan Lad**, professionally and personally.

## Audience
Everyone: professionals, creatives, startup people, generalists. A first-time visitor should understand who Shravan is within a few seconds, then be able to go as deep as they like.

## Structure
A simple, link-based site in the style of rishigurjar.com and chinmay.blog. The home page is short; each section is its own page.

| Page | What it is |
|---|---|
| **home** | name, email, rotating hero image, a short intro, and a plain list of links to everything else |
| **about** | a separate page where Shravan tells their story (written in their own voice) |
| **work** | projects, experience, resume download (page layout inspired by hrishabhayush.com) |
| **blog** | most important section. A list of posts (title + date); hovering a title shows a floating image |
| **photography** | a portfolio page, all on one page: a film roll of Shravan's film photos that scrolls like a strip of film, then separate sections (like a portfolio). Instagram: instagram.com/opticsbyshrvn |
| **rabbit hole** | music (playlists) plus "all things cool": favorite bands, favorite facts, random things Shravan likes. Reached with a special transition (see Later) |

## Core features (v1)
1. **Rotating hero image** on the home page. Cycles through a folder of Shravan's photos and references every ~5 seconds, picked randomly. This is the main personality moment.
2. **Link list** on the home page to about, work, blog, photography, rabbit hole.
3. **Blog**: posts are plain files in the repo. List page with hover images; each post is its own page.
4. **Work page**: project cards (title, dates, one-line description, tech tags, links), experience list, resume download.
5. **Photography page**: a "film roll" strip of film photos, plus portfolio sections on the same page. Photos are added by dropping files into a folder (see Open questions for Instagram).
6. **Rabbit hole page**: minimal lists (music picks, favorites, facts).
7. **Green accent banner** with flickering grain (inspired by ronaldleung.co) on the work page as a design element.

## Non-goals for v1
- No login, database or accounts (fully static)
- No blog admin panel or comments
- No print sales
- No live Spotify integration (embeds and links only)
- No dark mode
- No horizontal-scroll storytelling (the film roll on the photography page is the one exception)
- No automatic Instagram sync in v1

## Later (after v1)
- The black-hole "fall in" transition for the rabbit hole link (inspired by somehowliving.tech; needs original artwork and animation)
- Dark mode
- Custom domain `shravanlad.com` (bought on Namecheap, pointed at GitHub Pages)

## Content status
- **Have:** resume, one photo.
- **Need:** bio and about story, project descriptions, more photos for the hero and gallery, blog posts, favorites lists. Placeholders go in first; Claude helps draft the real text.

## Address
Start at `shhravan.github.io/personal-website`, then move to `shravanlad.com`.

## Success looks like
- The site is live and Shravan can explain every file in it.
- A stranger can find who Shravan is, see their work, and read the blog in under a minute.
- It feels like Shravan: simple, personal, tasteful.

## Open questions
- Which images go in the hero rotation (photos, art, references)?
- What the about story covers.
- Whether the resume is a PDF linked from work.
- Which posts the blog launches with.
