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
- **Background:** creamy (`#f3ecdc`, inspired by somehowliving.tech).
- **Text:** near-black ink, with a softer gray for dates and captions.
- **Accent:** a deep green (inspired by ronaldleung.co). Used sparingly: hover color, and the banner on the work page.
- **Links:** everywhere, in the full text color (a step brighter than the soft grey text) and underlined; the underline fades on hover. Green is saved for the work banner.
- **Dark mode:** a small wall light switch drawn from scratch, fixed in the top-left corner of every page. Lever up with "on" is light mode (the on/off label is in a pixel font, Silkscreen, like a stamped hardware label); click it and the lever flips down with "off" and the page goes dark. The site starts in dark mode for everyone (Shravan's choice) until the visitor flips the switch, then remembers the choice. Clicking it plays a short synthesized switch click (Web Audio, no file). It is a real button, so it works with a keyboard (Tab, then Space or Enter) and screen readers (announced as a switch).

## Home page
Top bar (every page), fixed while scrolling, sized in `vw` on wide screens so browser zoom doesn't change it:
- **left:** wall light switch with pixel-font on/off label (light/dark mode)
- **center:** name mark श्रवण लाड / SHRAVAN LAD (`images/logo.png` used as a mask in the text color, so it flips with the theme), same height as the switch
- **right:** turntable record with tonearm; click swings the needle on and plays Shravan's song (YouTube `ZoSD4l32m2I` from 0:28) in a hidden YouTube player; click again pauses
- the bar is transparent at the top; a soft frosted strip fades in only after scrolling, so content passes under it cleanly

Content column, centered vertically and horizontally in the window (`zoom: 0.8` on wide screens so it fits one screen):
1. **Rounded hero photo** (1.9:1, 4:3 on phones). Swaps every 0.4–1 s (random length), shuffled so none repeats until all have shown, never twice in a row, instant swap. Each photo framed by hand (`FOCUS` in `script.js`). Click anywhere on the page (not links/buttons, not while selecting text) to skip to the next.
2. **Intro**, Shravan's words: "student at cornell, intellectually curious about things as they come." / "i take cool photos, have a genre-bending music taste, play few instruments. this is the one place to get to know me."
3. **Links** (about, work, blog, photography, rabbit hole) on the left; profile icons stacked on the right (LinkedIn, X, YouTube Music, GitHub), right edge aligned with the photo. Icons from Simple Icons (CC0).
4. **Last line**, centered: "for if you have taste, *opticsbyshrvn*" (Instagram).

## Every page shares the home page's look
About, work, blog, photography and rabbit hole (and any page added later) use the same top bar, letter field and shore, centered column, typography and the "for if you have taste" sign-off. Only the shuffling photo is home-only. The name mark links home.

The music never stops when you change pages: links between our own pages swap the content in place (the top bar and hidden player stay), instead of loading a fresh page.

Phones: smaller top bar, 1.75rem side margins, slightly smaller text, extra spacing between blocks. The name, location and email lines were removed by choice.

## About
Separate page with a long-form personal story, written in Shravan's voice, set as plain readable text (inspired by chinmay.blog).

## Blog
- A plain list: title, then date underneath.
- Hovering a title shows a floating image near the cursor (inspired by rishigurjar.com/blog).
- Each post is its own simple page with a "← back" link.

## Work
Built. Row layout inspired by hrishabhayush.com, page organisation by ronaldleung.co, in this site's fonts and colors. Normal capitalization on this page (Shravan's choice; the rest of the site stays lowercase).
- **Banner:** deep green box with flickering TV-static grain (CSS, 1.5 s loop), "Work" and a one-line subtitle.
- **Panels:** About, Work Experience, Education and Honors each sit in a soft rounded box.
- **Rows:** rounded logo (links to the organisation's site where there is one), name in bold, small grey lines underneath, dates on the right; click a row for details.
- **Projects:** heading, then simple stacked cards (title + one line). For now one "Coming Soon" card.
- Logos in `images/logos/`, from Shravan; Cornell's seal (SVG) from Wikimedia Commons.

Still planned:
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

## Letter field (every page)
A faint field of small letters (EB Garamond, in the text color) covers the whole window behind every page, drawn with WebGL by `field.js`. A few letters twinkle. Near the cursor the letters dissolve in a grainy circle; a click sends a ripple outward that brightens and scrambles letters on its wave (the same click changes the photo). A subtle shore along the bottom edge: a faint, realistic shoreline from above: creamy white foam at the edge, pool-blue water (lighter near the edge, deeper further out) with a faint drifting net of light lines like the floor of a pool (caustics, drawn per pixel), low opacity sits at the bottom of the page (not the window, so on long pages it appears as you scroll to the end) and surges up quickly (~1.3 s) and drains back slowly (~3.5 s), with each stretch of shore and each wave a little different, like a beach seen from above, nearly invisible behind the writing. Not shown for reduced-motion or without WebGL. Inspired by contentarchitecture.dev, written from scratch.

## Motion
Deliberate, limited motion: hero photo rotation, the letter field and shore (every page), the light switch lever, the spinning record and tonearm, link hovers, and later the blog hover image, work banner grain and film roll. All of it stops for reduced-motion users.

## Not doing
- Horizontal scroll storytelling
- 3D illustrations
- A floating nav dock
- A quote on the home page (for now)
