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
- **Links:** blue and underlined, shifting to a darker blue over 0.2 seconds on hover (inspired by chinmay.blog). Green is saved for the work banner.
- **Dark mode:** a small "dark" / "light" text toggle in the top-right corner of every page. It follows the device setting until the visitor picks one, then remembers the choice. Dark palette: warm near-black background, off-white text, lighter blue links.

## Home page
Modeled on rishigurjar.com:
1. **Rounded-corner hero image** at the top, centered. Cycles through random images from a folder every 2 seconds, with a quick fade. Images are Shravan's own photos and references that mean something to them.
2. Name, location (ithaca, ny, traveling between new york, boston and india), and two emails written as `name [at] domain` so bots can't easily harvest them; script.js turns them into clickable mailto links.
3. A short intro (two lines) that runs the full width of the photo, then the plain list of links (about, work, blog, photography, rabbit hole), with no bullet points.
4. The last line, centered: "for if you have some taste, checkout @opticsbyshrvn" (links to Instagram).

Sizing follows rishigurjar.com, measured: the column is one third of the window width (kept between 20rem and 32rem), the space above the photo is about 18% of the window height, and spacing follows an 8px scale. On a phone the column fills the screen with 32px side padding.

## About
Separate page with a long-form personal story, written in Shravan's voice, set as plain readable text (inspired by chinmay.blog).

## Blog
- A plain list: title, then date underneath.
- Hovering a title shows a floating image near the cursor (inspired by rishigurjar.com/blog).
- Each post is its own simple page with a "← back" link.

## Work
Inspired by hrishabhayush.com, with the cream and green styling:
- **Banner** at the top: deep green with a grain texture that flickers like TV static, a 1.5s CSS loop (the effect Shravan liked on ronaldleung.co; we build our own version). Where else it could appear is still open.
- **Experience list:** one row per role, with name, title and date range.
- **Project cards** in a two-column grid: title, dates, one-line description, small tech tags, and links.
- **Resume** download link.

## Photography
All on one page, no camera details:
1. **Film roll:** all film photos in one horizontal strip that looks like a roll of film (frame borders, sprocket holes) and rolls slowly across the page. Hovering or dragging can pause or scrub it. Designed from scratch, not copied from anywhere.
2. **Portfolio sections** below it: named groups of photos (names chosen later by Shravan), each with a short lowercase caption per photo.
3. Link to Instagram: opticsbyshrvn.

## Rabbit hole (music + all things cool)
- Minimal lists, in the spirit of Rohan Kumar's "favorite facts": favorite bands, playlists (links or embeds), facts, random things Shravan likes.
- Later: the "fall in" transition from the home link into this page, inspired by somehowliving.tech.

## Motion
Almost none in v1. Allowed: the hero image rotation, link hover states, the blog hover image, the green banner grain, and the film roll on the photography page. Everything else is later.

## Not doing
- Horizontal scroll storytelling
- 3D illustrations
- A floating nav dock
- A quote on the home page (for now)
