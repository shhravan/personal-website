# DESIGN: shravan's personal website

Goal: super simple, with good taste. Personality comes from specific details (the hero image, captions, small facts), not decoration. Inspired by several sites, **adapted and customized, never copied**.

## Principles
- One narrow, centered column. Lots of whitespace.
- Lowercase and casual voice everywhere (nav, headings, captions, copy).
- Few colors, one typeface, no clutter.
- Every page works on a phone.

## Typography
- **EB Garamond** (a classic book serif) for the whole site (inspired by chinmay.blog).
- Lowercase headings and links. Body text about 18px with generous line height.
- Hierarchy through size and weight only.

## Color
- **Background:** warm cream (inspired by somehowliving.tech). Exact value chosen during the first build slice.
- **Text:** near-black ink, with a softer gray for dates and captions.
- **Accent:** a deep green (inspired by ronaldleung.co). Used sparingly: hover color, and the banner on the work page.
- No dark mode in v1.

## Home page
Modeled on rishigurjar.com:
1. **Rounded-corner hero image** at the top, centered. Cycles through random images from a folder about every 5 seconds. Images are Shravan's own photos and references that mean something to them.
2. Name, location, email (written so bots can't easily harvest it).
3. A short statement or two about who Shravan is.
4. A plain list of links: about, work, blog, photography, rabbit hole. No quote for now.

## About
Separate page with a long-form personal story, written in Shravan's voice, set as plain readable text (inspired by chinmay.blog).

## Blog
- A plain list: title, then date underneath.
- Hovering a title shows a floating image near the cursor (inspired by rishigurjar.com/blog).
- Each post is its own simple page with a "← back" link.

## Work
Inspired by hrishabhayush.com, with the cream and green styling:
- **Banner** at the top: green with a subtle grainy texture (inspired by ronaldleung.co).
- **Experience list:** one row per role, with name, title and date range.
- **Project cards** in a two-column grid: title, dates, one-line description, small tech tags, and links.
- **Resume** download link.

## Photography
- Grid of photos with short lowercase captions (inspired by chinmay.blog's "pictures" page).
- Link to Instagram: opticsbyshrvn.

## Rabbit hole (music + all things cool)
- Minimal lists, in the spirit of Rohan Kumar's "favorite facts": favorite bands, playlists (links or embeds), facts, random things Shravan likes.
- Later: the "fall in" transition from the home link into this page, inspired by somehowliving.tech.

## Motion
Almost none in v1. Allowed: the hero image rotation, link hover states, the blog hover image. Everything else is later.

## Not doing
- Horizontal scroll storytelling
- 3D illustrations
- A floating nav dock or dark mode toggle
- A quote on the home page (for now)
