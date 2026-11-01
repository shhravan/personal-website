# shravanlad.com — Style Reference

> A quiet, bookish personal site: cream paper, Garamond ink, and a few handmade objects (a light switch, a record player, a shoreline) that reward attention.

**Theme:** dark by default, with a full light (cream) theme. Visitors switch with the light switch, and the choice is remembered.

The site reads like a well-set page in a small book: one narrow column, generous margins, and a single serif typeface doing all the work. Hierarchy comes from size, weight and the soft grey of secondary text, never from color blocks or heavy rules. Personality lives in a handful of drawn, tactile objects in the corners and edges of the screen, each built from scratch: a wall switch for the theme, a turntable that opens into a dial of album covers, a faint field of letters, and a shoreline that washes in at the bottom of every page. Everything else stays out of the way. The voice is lowercase and casual everywhere except the work page, which uses normal capitalization for a more professional read.

Values below come from `styles.css`. Where the CSS uses `color-mix()`, the recipe is given instead of a fixed hex.

---

## Tokens — Colors

### Light theme (cream)

| Name | Value | Token | Role |
|---|---|---|---|
| Cream | `#f3ecdc` | `--bg` | Page background; the record label and dark-mode turntable echo it |
| Ink | `#1a1a1a` | `--ink` | Body text, headings, links, name mark, icon strokes |
| Soft | `#57544e` | `--soft` | Secondary text: dates, captions, role titles, labels, "soon" sections |
| Link | `#2563eb` | `--link` | Keyboard focus outlines only |
| Link hover | `#1e40af` | `--link-hover` | Hover color on icons, the switch label and role names |
| Photo well | `#e9e5da` | `--photo-bg` | Behind the hero photo while it loads |
| Plate | `#ece8de` | `--plate` | Light switch wall plate and lever lip |
| Slot | `#fbfaf6` | `--slot` | Light switch slot |
| Lever | `#d6d1c4` | `--lever` | Light switch lever face and box sides |

### Dark theme (default)

| Name | Value | Token | Role |
|---|---|---|---|
| Night | `#161512` | `--bg` | Page background, a warm near-black rather than pure black |
| Bone | `#ece8de` | `--ink` | Body text and headings |
| Soft | `#c2bdb1` | `--soft` | Secondary text |
| Link | `#7aa2ff` | `--link` | Focus outlines |
| Link hover | `#a9c1ff` | `--link-hover` | Hover color |
| Photo well | `#25231f` | `--photo-bg` | Behind the hero photo |
| Plate / Slot / Lever | `#2a2823` / `#0d0c0a` / `#4d493f` | `--plate` `--slot` `--lever` | Light switch parts |

### Fixed colors (same in both themes)

| Name | Value | Role |
|---|---|---|
| Vinyl | `#111`, grooves `#0d0d0d`–`#141414` | Records are always black vinyl |
| Label cream | `#f1e9d6` → `#d8ccb1` (radial) | Record label, printed in ink at 85% |
| Water | `#5f8f99` | Base of the banner: mixed 34% into `--bg` for the fill, 58% for the rim |
| Power light | off `#6b2a22`, on `#e2553f` with an 8px glow | Turntable LED while a song plays |
| Turntable (light mode) | `#45433f` → `#2e2d2a`, edge `#1b1a18` | Charcoal base, so the record stands out on cream |
| Turntable (dark mode) | `#f3ecdc` → `#e4dac4`, edge `#b8ab90` | Cream base, so the record reads from across the room |

### Mixed surfaces

| Name | Recipe | Role |
|---|---|---|
| Panel | `--ink` 4% into `--bg`, border `--ink` 9% | Section boxes on the work page |
| Card | `--bg` 70% with white (dark: `--ink` 6% into `--bg`) | Project cards |
| Frost | `--bg` at 78–82% opacity + 10–14px blur | Top bar strip, deck readout, now-playing card |
| Hairline | `--ink` at 9–18% | Borders, tick marks, dividers |

---

## Tokens — Typography

### EB Garamond — everything
The one text face: headings, body, links, dates, the deck readout. A classic book serif with a small x-height, so it is set a little larger than usual.
- **Fallbacks:** Noto Serif Devanagari (fills in only the Devanagari letters), Georgia, serif
- **Weights:** 400 (body), 500 (page titles, role names, card titles), 700 (section headings, emphasis)
- **Styles:** italic for subtitles, artists and the sign-off
- **Base size:** about 17px on screen everywhere (inside the column: 1.33rem on wide screens, where the column is zoomed to 80%; 1.06rem on phones)
- **Line height:** 1.5 (1.6 on phones, 1.7 in blog posts)
- **Numerals:** `tabular-nums` for dates so they line up

### Silkscreen — stamped labels
A pixel font used only for tiny hardware-style labels: the switch's ON/OFF, the record label, "NOW SELECTING" and "NOW PLAYING".
- **Sizes:** 5.6–10px, always uppercase
- **Letter spacing:** 0.08em (switch) up to 0.28em (deck readout)
- Loaded for those letters only

### Display set — the "opticsbyshrvn" sign-off
Ten fonts the sign-off cycles through every 1.5 s, each loaded only for the letters of that one word: Instrument Serif (italic), Gloock, Bodoni Moda (italic), Italiana, Young Serif, Fraunces (italic, light, opsz 144), Unbounded (300), Jacquard 12, Doto (700), Pixelify Sans. Each must look clearly different from the last and must draw lowercase.

### Type Scale
Three clearly different steps, so a page scans at a glance: **page titles about 40px, section headings about 22px, body about 17px** (sizes as seen on screen). Small text is set in em, so it follows the body size.

| Role | Family | Weight | On-screen size | Line height | Letter spacing |
|---|---|---|---|---|---|
| Page / banner / post title | EB Garamond | 500 | ~40px (34px on phones) | 1.1 | — |
| Section heading | EB Garamond | 700 | ~22px | 1.5 | — |
| Body | EB Garamond | 400 | ~17px | 1.5 | — |
| Post body | EB Garamond | 400 | 1.12rem | 1.7 | — |
| Sign-off | EB Garamond / display set | 400 | 1.08rem | 1.5 | — |
| Role title / card text | EB Garamond | 400 | 0.8em | 1.3 | — |
| Role notes | EB Garamond | 400 | 0.82em | 1.5 | — |
| Dates, meta | EB Garamond | 400 | 0.72em | 1.5 | — |
| Label ("explore") | EB Garamond | 400 | 0.68em uppercase | 1.2rem | 0.14em |
| Deck readout title | EB Garamond | 400 | 30px | 1.1 | — |
| Deck readout artist | EB Garamond italic | 400 | 18px | 1.5 | — |
| Hardware label | Silkscreen | 400 | 8–10px uppercase | 1 | 0.08–0.28em |

---

## Tokens — Spacing & Shapes

**Base unit:** 8px (0.5rem). Most gaps are multiples: 8, 16, 24, 32, 40, 64.
**Density:** airy. More space between groups than within them.

### Spacing Scale

| Use | Value |
|---|---|
| Between list items | 0.05rem (desktop), 0.2rem (phones) |
| Paragraph gap | 0.6rem |
| Between panels | 1.2rem |
| Below hero photo | 1.5rem (2rem on phones) |
| Above links | 1.2rem (2rem on phones) |
| Between work sections | 2.4rem |
| Above sign-off | 2.5rem (3rem on phones) |
| Column side padding | 2rem desktop, 1.75rem phones |

### Border Radius

| Element | Radius |
|---|---|
| Switch, focus rings | 0.3rem |
| Hero photo, post images, code blocks | 0.4rem |
| Logo tiles | 0.55rem |
| Panels, cards, toast | 0.6rem |
| Banner, deck readout | 0.7rem |
| Turntable base | 46px (on a 400px box) |
| Record, play button, screws, knob | 50% |

### Shadows

| Name | Value | Use |
|---|---|---|
| Record lift | `0 12px 26px rgba(0,0,0,.32), 0 2px 6px rgba(0,0,0,.28)` | Full-size record |
| Readout float | `0 10px 30px rgba(0,0,0,.25)` | Card beside the dial |
| Toast float | `0 8px 24px rgba(0,0,0,.22)` | Now-playing card |
| Turntable depth | solid `-10px 12px 0` edge + `-14px 26px 40px rgba(0,0,0,.5)` | Base seen slightly from the side, like the switch |
| Pressed button | `inset 0 1px 2px rgba(0,0,0,.25)` | Play/pause button |

### Layout
- **Column:** `max-width: 38rem` on section pages. The home column is `clamp(25rem, 41.667vw, 40rem)` at `zoom: 0.8`, so it fits one screen.
- **Centering:** pages are centered both ways in the window (`body:has(main.col)` with flexbox).
- **Breakpoints:** 48rem (tablet and up), 64rem (large screens: the space above grows to `100vh / 7`), 1024px with a mouse (record deck).
- **Top bar:** sized in `vw` from 48rem up (numbers tuned at a 1440px window), so browser zoom doesn't change it.

---

## Components

### Light Switch
**Role:** theme toggle, fixed top-left on every page.
A wall switch drawn in SVG: a plate with four screws, a slot and a lever, with a darker strip on the left and bottom that fakes a 3D box. Lever up with "ON" is light mode; lever down with "OFF" is dark. The lever slides 12px in 0.18s. Clicking plays a synthesized click (a 25ms filtered noise snap plus a falling low tone). It is a real `<button role="switch">`, first in the tab order.

### Name Mark
**Role:** identity and the link home, top center.
श्रवण लाड over SHRAVAN LAD, drawn from `images/logo.png` used as a CSS mask filled with `--ink`, so it flips with the theme. Same height as the switch (2.4rem; 2.67vw on wide screens).


### Top Bar Strip
**Role:** keeps the corners readable while scrolling.
Invisible at the top of the page. After scrolling, a frosted strip (`--bg` at 82%, 10px blur) fades in over 0.25s behind the switch, name and record, with a soft faded bottom edge instead of a line.

### Small Record (phones and tablets)
**Role:** music on touch screens.
A black record with grooves, two light streaks and a cream label, plus a tonearm. Tapping swings the arm on (0.6s), spins the record (1.8s per turn) and plays a shuffled song from side A; tapping again pauses. It keeps a thin `--soft` rim in dark mode.

### Record Deck (desktop)
**Role:** the signature object, a jukebox in the corner.
- **At rest:** a tiny record on a turntable base in the top-right corner, level with the switch. The base is charcoal on cream and cream on dark, with a solid side edge, four slotted screws, a speed knob and a power light that glows red while playing.
- **Open:** hovering anywhere on the turntable grows the record to full size in 0.55s (`cubic-bezier(.2,.8,.2,1)`) and fans out a dial of 15 album covers from the right edge to the top edge. Covers are ring slices that spring in one after another (28ms apart), drift slowly (10° over 60s) and carry fine tick marks. The two end covers run past the window edges.
- **The record:** fine repeating grooves, four wider track gaps, a raised rim, a cream label printed with the name mark, "ALL OVER THE PLACE" and "SIDE A", and a groove sheen that turns toward the cursor while playing.
- **Hover a cover:** it pops outward in full color while the rest go grey (`grayscale(.75) brightness(.45)`), and a frosted readout beside the dial shows "NOW SELECTING · 04", the title in 30px Garamond and the artist in italic.
- **Playing:** the playing cover keeps a bright 2px rim and the others dim a little; the readout says "NOW PLAYING" or "PAUSED".

### Audio
**Role:** the music itself.
The 15 songs are self-hosted MP3s in `audio/` (128 kbps or less, tags stripped), named after their covers and listed in `TRACKS` in `theme.js`. Nothing downloads until a song plays; Memory Box starts at 0:28 and Clown on the 22nd Floor + Happiness at 1:50. No ads, no third-party player.

### Now-Playing Toast
**Role:** confirms a song change.
A small frosted card under the record (right-aligned, max 260px): a Silkscreen "NOW PLAYING" label, the title and an italic "by artist". It slides down 6px into place, stays 4s, and is hidden while the dial is open.

### Play/Pause Button
**Role:** quick control without opening the dial.
A 26px round button just left of the turntable, with an inset shadow like a pressed key. It appears only after a song has actually played, springing in from 60% scale, and hides while the dial is open.

### Film Strip (home hero)
**Role:** the home page's personality moment; the page is a cover, not reading.
A roll of 35mm-style film drawn on a `<canvas>` (`script.js`, no libraries): each frame is a photo in black film with cream sprocket holes, small gold frame numbers and a faint "LAD 400" edge marking. It runs edge to edge across the middle of the screen in a gentle wave that slowly drifts, and darkens slightly where it turns away (a faked 3D twist). It rolls steadily, one frame every 3s (2.4s while a song is playing). The 27 photos are shuffled once per visit and loop; each is framed with its `FOCUS` point and zoom. Drag it, or swipe and let go to fling it (it spins fast, then eases back to its normal roll); tap a frame to bring it to the middle, click anywhere else to skip ahead; Enter, Space and the arrow keys work while it's focused. It slows to a crawl while the mouse is on it, stops when the tab is hidden, and holds still for reduced motion (it still moves when you ask it to). The letter field is not faded on the home page.
Adapted from the idea of a moving film-strip hero (Holmchrome, a Framer template); the drawing, markings, behaviour and look are our own.

### Top Navigation and Profile Icons (every page)
**Role:** site navigation, added by `theme.js` so every page (blog posts included) gets the same.
The sections in one centred row under the top bar, in Silkscreen (13px, 9px on phones, all on one line): work, projects, blog, photography, rabbit holes. Just the words: no line in front, no underline; a link dims on hover. Sections with nothing in them yet are grey and not links. Profile icons (GitHub, LinkedIn, X, YouTube Music; 1.3rem, in `--soft`) sit centred in one row just above the sign-off at the bottom of every page (on the home page, just above the water). No link previews on the home page.

### Sign-off
**Role:** a closing line on every page.
"*opticsbyshrvn*", centered, linking to Instagram, cycling through the display set. Hovering fades in a thin hand-drawn arrow to its right and the note "for if you have taste" beneath it; on touch screens both stay visible.

### Link Preview
**Role:** a peek at where a link goes.
Hovering a link (mouse only) shows a 240×150 card with a screenshot of the destination, below-right of the cursor (flipped near window edges). It fades in after 120 ms, glides after the cursor on a soft spring and leans up to 6° into the motion; 0.6rem corners, hairline rim, soft shadow. Covers the site's own pages and outside links; social profiles (LinkedIn, X, Instagram, YouTube Music, Forbes, Substack) and sites that block automated browsers have none. Screenshots: `images/previews/` (listed in `index.json`), taken by `scripts/capture_previews.cjs`.

### Water Banner
**Role:** title block on the work and projects pages, and the "Get in touch" block.
A box filled with water blue mixed into the page color, a 1.5px rim, 0.7rem corners. Two layers move inside it: a fine speckle of dots that jumps in 6 steps every 1.5s like film grain (white specks in dark mode, soft blue on cream) and faint ripples drifting over 16s. Title in 1.7rem Garamond 500, subtitle in `--soft`.

### Panel
**Role:** groups a section on the work page.
A soft box (ink 4% into the page color, 9% hairline border, 0.6rem corners). Holds About, Work Experience, Education and Honors.

### Role Row
**Role:** one job, school or award.
A 2.5rem logo tile (the Cornell seal repeats on each Education and Honors row; 0.55rem corners; it grows 6% on hover when it links out), the name in Garamond 500, the title in small grey, and dates right-aligned in tabular figures. Rows with details expand on click (`<details>`), showing notes indented to line up under the name.

### GitHub Activity (projects page)
The last year of contributions as a grid of small squares (one per day, a column per week), in `--ink` at 6/22/42/66/90% strength, so it matches the paper in both themes. Month labels in Silkscreen; the total and a link to github.com/shhravan underneath. Data from `data/github.json`, refreshed nightly by a GitHub job.

### Project Rows (projects page)
Same ledger and `<details>` rows as the work page, without logos. Opened, a row shows a small definition list: PROBLEM, BUILT, RESULT, LINKS (labels in Silkscreen).

### Project Card
**Role:** one project.
A light card (0.6rem corners, hairline border): a title in 500 and one line of grey text.

### Blog List and Post
**Role:** reading.
The list is titles at 1.15rem with the date underneath in grey. A post has a 1.9rem title, an italic subtitle, a meta line ("date · N min read · also on substack"), then the body at 1.12rem / 1.7 line height. Images get 0.4rem corners, quotes a 2px left rule in italic grey, and dividers a faint hairline.

---

## Share Previews
When a page is shared (iMessage, Slack, Discord, LinkedIn, X), apps show `images/og/home.jpg` (1200×630: the home page in dark mode with the film strip and shoreline), and apps that play video show `images/og/home-loop.mp4` (6.5 s loop of the strip rolling, recorded frame by frame at 30 fps). Each page has its own title, description and address; synced blog posts use the post's title and subtitle.

## Do's and Don'ts

### Do
- Use EB Garamond for all text; build hierarchy with size, weight (400/500/700) and `--soft`.
- Keep everything in one centered column with generous margins.
- Write in lowercase on every page except the work page.
- Mix new surfaces from `--ink` and `--bg` with `color-mix()` so they work in both themes.
- Draw new objects by hand (SVG or CSS) with the same tactile detail: screws, edges, soft shadows.
- Give every motion a reduced-motion fallback, and every control a keyboard path and a label.
- Frame every new hero photo by hand.

### Don't
- Don't add a second text typeface or use display fonts outside the sign-off.
- Don't use saturated color blocks, gradients as decoration, or heavy borders.
- Don't use pure black or pure white backgrounds.
- Don't use stock icons or illustrations besides the CC0 profile icons.
- Don't animate for its own sake: motion lives only in the hero, the field, the shore, the corner objects and the banner.
- Don't add pop-ups, floating docks or horizontal-scroll storytelling.

---

## Surfaces

| Level | Name | Value | Purpose |
|---|---|---|---|
| 0 | Page | `--bg` | Background of every page |
| 0.5 | Letter field | `--ink` letters at low opacity, fainter behind the column | Texture behind everything |
| 1 | Panel / card | ink 4–6% into `--bg` | Grouped content |
| 1 | Banner | water blue 34% into `--bg` | Page titles, get in touch |
| 2 | Frost | `--bg` 78–82% + blur | Top bar strip, readout, toast |
| 3 | Objects | the record, the turntable, the switch | Tactile items with their own shadows |

## Elevation
Mostly flat. Shadows are reserved for physical objects (the record, the turntable, the floating readout and toast), and they are soft and directional, as if lit from the upper right. Text and panels never cast shadows.

## Imagery
- **Hero photos:** a personal mix of film stills, album art, paintings, places and moments, shown full-bleed in the rounded frame with no captions or overlays.
- **Album covers:** square art clipped into ring slices in the dial.
- **Logos:** organization logos in rounded tiles on the work page.
- **Format:** WebP, two sizes per hero photo (1200px and 700px), metadata stripped.

## Layout
One column, centered in the window both ways. The home page fits a single screen on desktop; section pages scroll, with the top bar fixed and the shoreline appearing only at the true bottom of the page. Links between the site's own pages swap the content in place, so the top bar, the record and the music never reload.

---

## Background: Letter Field and Shoreline
A faint grid of small Garamond and Devanagari letters covers the window, drawn with WebGL (`field.js`). A few letters twinkle. Near the cursor they dissolve in a grainy circle; a click sends a ripple outward that brightens and scrambles letters on its wave. Letters fade to about a third behind the content column so text stays readable.

At the bottom of each page, a shoreline seen from above: cream foam at the edge, then pool-blue water with drifting caustic lines, at low opacity. Each wave surges up quickly (about 1.3s) and drains back slowly (about 3.5s), with each stretch of shore and each wave a little different. Moving the cursor over the water drops small ripples. The field and shore are off for reduced motion or without WebGL.

## Motion

| Element | Timing | Easing |
|---|---|---|
| Hero swap | every 1.5s, instant | — |
| Sign-off font | every 1.5s | — |
| Switch lever | 0.18s | ease |
| Link underline fade, list-link hover line | 0.2s | ease |
| Top bar strip | 0.25s | ease |
| Record spin | 1.8s per turn | linear |
| Tonearm swing (small record) | 0.6s | ease |
| Deck open / close | 0.55s | `cubic-bezier(.2,.8,.2,1)` |
| Cover spring-in | 0.6s, 28ms stagger | `cubic-bezier(.2,.9,.25,1.15)` |
| Dial drift | 10° over 60s | linear |
| Banner grain | 1.5s, 6 steps | steps |
| Banner ripples | 16s, alternating | ease-in-out |
| Toast | 0.45s in, 4s hold | `cubic-bezier(.2,.8,.2,1)` |

All of it stops under `prefers-reduced-motion`.

---

## Page Notes
- **Home:** hero photo, section links, profile icons, sign-off. No intro text (removed ahead of a home page redesign).
- **Work:** water banner, then panels for About, Work Experience, Education and Honors, then a "Get in touch" banner ("Just reach out on X or email me at …", with the address assembled by script).
- **Projects:** water banner ("Projects", "Things I'm building."), then cards. One "Coming Soon" card for now.
- **Blog:** synced from Substack; list and post pages as described above.
- **Photography (planned):** a film-roll strip of film photos that scrolls slowly (frame borders, sprocket holes; hover or drag to pause or scrub), then named portfolio sections with short lowercase captions.
- **Random rabbit holes (planned):** minimal lists of favorite bands, playlists and facts.

---

## Quick Start

### CSS Custom Properties
```css
:root {
  /* light (cream) */
  --bg: #f3ecdc;
  --ink: #1a1a1a;
  --soft: #57544e;
  --link: #2563eb;
  --link-hover: #1e40af;
  --photo-bg: #e9e5da;
}
:root[data-theme="dark"] {
  --bg: #161512;
  --ink: #ece8de;
  --soft: #c2bdb1;
  --link: #7aa2ff;
  --link-hover: #a9c1ff;
  --photo-bg: #25231f;
}
body {
  font-family: "EB Garamond", "Noto Serif Devanagari", Georgia, serif;
  font-size: 1.15rem;
  line-height: 1.5;
  background: var(--bg);
  color: var(--ink);
}
```

### Record on phones
Phones and tablets get a bottom sheet instead of the desktop deck: the now-playing card in the deck's type and a swipeable row of covers (no second vinyl: the corner record is the player). It slides away 5 seconds after a song is picked, or after the last touch. The playing cover lifts with an ink rim and the others dim, like the desktop dial.

### Work page: the ledger
No boxed panels on the work page: sections are divided by thin rules, with the section name in small caps (Silkscreen) in a 10rem left margin on desktop and above the section on phones. The column is wider there (up to 62vw).
