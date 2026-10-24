# Design

Simple, with good taste. Personality comes from specific details (the hero photos, the record deck, small facts), not decoration.

## Principles
- One narrow, centered column with plenty of whitespace.
- Lowercase, casual voice across the site. The work page uses normal capitalization.
- Few colors, one text typeface, no clutter.
- Every page works on a phone; all motion stops for reduced-motion users.

## Typography
- **EB Garamond** for all text; hierarchy through size and weight only. Body text about 18px with generous line height.
- **Noto Serif Devanagari** for the Devanagari name mark letters, **Silkscreen** for the switch's on/off label.
- **"opticsbyshrvn" fonts:** the Instagram line cycles through ten display fonts, loaded only for those letters: Instrument Serif (italic), Gloock, Bodoni Moda (italic), Italiana, Young Serif, Fraunces (italic, light), Unbounded (light), Jacquard 12, Doto (bold), Pixelify Sans. Every font in the set must draw lowercase.

## Color
- **Background:** cream `#f3ecdc` in light mode; near-black in dark mode.
- **Text:** near-black ink, with a softer grey for dates and captions.
- **Links:** full text color, underlined; the underline fades on hover.
- **Accent:** a muted water blue for the banners on the work and projects pages.
- **Dark mode:** a wall light switch drawn in SVG, fixed top-left on every page. Lever up ("on") is light, down ("off") is dark. The site starts dark until the visitor flips it, then remembers the choice. A short synthesized click plays (Web Audio, no file). It is a real button with `role="switch"`, usable by keyboard and screen readers.

## Top bar (every page)
Fixed while scrolling, sized in `vw` on wide screens so browser zoom doesn't change it. Transparent at the top; a soft frosted strip fades in after scrolling.
- **Left:** the light switch.
- **Center:** name mark श्रवण लाड / SHRAVAN LAD (`images/logo.png` used as a CSS mask, so it follows the theme). Links home.
- **Right, phones and tablets:** a small turntable; tapping swings the tonearm on and plays Memory Box. The player preloads so the first tap plays.
- **Right, desktop (mouse, 1024px+): the record deck.**
  - At rest: a tiny record on a small turntable base (cream in dark mode, charcoal in light) with corner screws, a speed knob and a power light that glows while playing.
  - Hovering anywhere on the turntable opens a frosted dial of 15 album covers running from the right edge to the top edge; the end covers run past the window edges. The record grows to full size: fine grooves, a cream label printed "ALL OVER THE PLACE / SIDE A", a cursor-following groove sheen while playing, and a brushed-metal tonearm.
  - Hovering a cover pops it out in full color and shows the song and artist on a frosted card. Clicking plays it right away and closes the dial.
  - Songs shuffle: every song plays once before any repeats. A "NOW PLAYING" card slides in for 4 s on each change, and the playing cover stays highlighted in the dial.
  - Once a song has played, a round play/pause button sits just left of the turntable.
  - Songs and covers live in `TRACKS` in `theme.js` and `images/covers/`.

## Home page
Centered in the window (`zoom: 0.8` on wide screens so it fits one screen):
1. **Hero photo** (1.9:1, 4:3 on phones), rounded. Swaps every 2 s, shuffled, never the same twice in a row. Each photo is framed by hand (`FOCUS` in `script.js`). Clicking empty space skips to the next.
2. **Intro:** "student at cornell, intellectually curious about things as they come." / "i take cool photos, have a genre-bending music taste, play few instruments. this is the one place to get to know me."
3. **Links** (work, projects, blog, photography, random rabbit holes) on the left; profile icons (GitHub, LinkedIn, X, YouTube Music) stacked on the right, aligned with the photo's edge. Icons from Simple Icons (CC0).
4. **Sign-off:** "*opticsbyshrvn*" (Instagram), switching font every 2 s. Hovering shows a drawn arrow and the note "for if you have taste"; on touch screens both stay visible.

## Shared layout
Every page uses the home page's top bar, letter field, shoreline, column and sign-off; only the hero photo is home-only. Links between the site's own pages swap the content in place (the top bar and player stay), so music never stops.

Phones: smaller top bar, 1.75rem side margins, slightly smaller text, more space between blocks.

## Work
- **Banner:** muted water blue mixed from the page color, a thin rim, faint drifting ripples and a fine speckle of dots; "Work" and a one-line subtitle.
- **Panels:** About, Work Experience, Education and Honors, each in a soft rounded box.
- **Rows:** rounded logo (linking to the organization where there is one), name in bold, grey detail lines, dates on the right; click a row to expand details.
- **Get in touch:** the same water banner: "Just reach out on X or email me at …" (the address is assembled by `script.js`).
- Logos live in `images/logos/`.

## Projects
The same water banner ("Projects", "Things I'm building."), then stacked cards. One "Coming Soon" card for now.

## Blog
Posts are written on Substack and synced automatically (see TECH_RULES).
- List page: title, then date.
- Post page: title, italic subtitle, date · reading time · "also on substack", then the text, with a "← blog" link.
- Planned: a floating image near the cursor when hovering a title.

## Photography (planned)
All on one page:
1. **Film roll:** film photos in one horizontal strip styled as a roll of film (frame borders, sprocket holes) that scrolls slowly; hovering or dragging pauses or scrubs it.
2. **Portfolio sections:** named groups of photos with short lowercase captions.
3. A link to Instagram.

## Rabbit hole (planned)
Minimal lists: favorite bands, playlists, facts, things worth knowing about.

## Letter field and shoreline (every page)
A faint field of small letters in the text color covers the window, drawn with WebGL by `field.js`. A few letters twinkle; near the cursor they dissolve in a grainy circle; a click sends a ripple outward. At the bottom of the page, a subtle shoreline seen from above: foam at the edge and pool-blue water with drifting caustic lines that surges up quickly and drains slowly, each wave a little different. Moving the cursor over the water drops small ripples. Disabled for reduced motion or without WebGL.

## Motion
Limited and deliberate: hero rotation, letter field and shoreline, light switch lever, record and tonearm, link hovers. Everything stops for reduced-motion users.

## Not doing
- Horizontal-scroll storytelling (the film roll is the one exception)
- 3D illustrations
- A floating nav dock
