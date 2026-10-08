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
- **Dark mode:** a small wall light switch drawn from scratch, fixed in the top-left corner of every page. Lever up with "on" is light mode; click it and the lever flips down with "off" and the page goes dark. It follows the device setting until the visitor chooses, then remembers the choice. It is a real button, so it works with a keyboard (Tab, then Space or Enter) and screen readers (announced as a switch).

## Home page
Modeled on rishigurjar.com:
1. **Rounded-corner hero image** at the top, centered. Cycles through random images from a folder every second, in a truly random order (every pick is an independent random choice, so there is no sequence to predict; the only rule is the same photo never shows twice in a row), swapping instantly with no fade (like rishigurjar.com). Every photo is framed by hand so it looks good in the wide frame: a focal point and, where the subject is small or a painting has a frame to cut off, a zoom (the `FOCUS` list in `script.js`). Clicking or tapping anywhere on the home page, including the empty space around the content, jumps to the next photo and restarts the countdown. Links and the light switch still do their own thing, and a click while text is selected does nothing. Images are Shravan's own photos and references that mean something to them.
2. **Shravan Lad** in bold, then the location line "Ithaca, NY 🔁 Boston, New York & भारत", then two emails written as `name [at] domain [dot] tld` so bots can't easily harvest them; script.js turns them into clickable mailto links. The name and place names use normal capitals; the rest of the page stays lowercase.
3. A short intro in Shravan's own words (two lines: "student at cornell, intellectually curious about things as they come." and "i take cool photos, have a genre-bending music taste, play few instruments. this is the one place to get to know me.") that runs the full width of the photo, then the plain list of links (about, work, blog, photography, rabbit hole), with no bullet points.
4. A row with the link list on the left and the profile icons stacked vertically on the right (LinkedIn, X, YouTube Music, GitHub), the icons' right edge exactly on the photo's right edge. Icons are inline SVG from Simple Icons (CC0).
5. The last line, centered: "for if you have taste, *opticsbyshrvn*" (the italic handle links to Instagram).

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
