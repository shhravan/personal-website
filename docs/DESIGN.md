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

## Font library (for future use)
All from Google Fonts (free). EB Garamond stays the site's only text font; these are for small, playful moments. The first set is what "opticsbyshrvn" cycles through.

**In use: the "opticsbyshrvn" set** (chosen with Shravan for variety: each switch should look clearly different)
| Font | Style | Feel |
|---|---|---|
| Instrument Serif | italic | elegant, editorial |
| Gloock | regular | chunky, characterful serif |
| Bodoni Moda | italic | classic high-contrast fashion serif |
| Italiana | regular | thin, airy, art deco |
| Young Serif | regular | bold, friendly old-style |
| Fraunces | italic, light (opsz 144) | soft, curly, "wonky" |
| Unbounded | light 300 | wide, rounded, futuristic |
| Jacquard 12 | regular | pixel blackletter |
| Doto | bold 700 | dot-matrix display |
| Pixelify Sans | regular | pixel, echoes the switch's Silkscreen label |

**Also used:** EB Garamond (all text), Noto Serif Devanagari (Devanagari letters), Silkscreen (the switch's on/off label).

**Looked at and set aside** (fine fonts, but very common or too alike): Playfair Display, DM Serif Display, Cormorant Garamond, Space Mono, Bricolage Grotesque. Syne extra-bold and Shrikhand were dropped as too heavy. Major Mono Display and Monoton were dropped because they only draw capitals; every font in the set must show lowercase.

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
- **right, phones and tablets:** small turntable record with tonearm; tap swings the needle on and plays Memory Box (YouTube `ZoSD4l32m2I` from 0:28) in a hidden YouTube player; tap again pauses. The player preloads so the first tap plays.
- **right, desktop (mouse, 1024px+): the record deck.** A realistic record in the top-right corner, tiny at rest, sitting in the top bar level with the switch and name mark (it sits on a small turntable base, cream in dark mode and charcoal in light mode, drawn with the switch's side depth, corner screws and a power light that glows while playing; the base is a little taller than wide, with a recessed control strip under the record: speed knob left, power light right, and the play/pause key in the middle (dim until a song has played); the base fades when the dial opens), springing to full size when the dial opens and shrinking back once a song is chosen: fine grooves with track gaps, a cream label (the page's own cream) with the name mark, "ALL OVER THE PLACE" and "SIDE A" printed in ink, light streaks on the grooves (they follow the cursor while playing), a soft shadow, and a brushed-metal tonearm (base, counterweight, S-curve arm, cartridge). Hovering the record fans out a frosted dial of 15 album covers that runs from the right edge to the top edge, the two end covers run past the edges so each shows most of itself with a slice cut off by the window edge (angles worked out from the window width), with no empty space (spread so the same artist never sits side by side, each cropped to its most recognizable part) (cut to the ring's shape, staggered spring-in, slow drift, tick marks). Hovering a cover pops it out in full color, greys the rest, and shows the song and artist on a frosted card beside the dial (pixel-font "NOW SELECTING · 04" label, Garamond title, italic artist). Clicking a cover closes the dial and plays it right away: the needle swings on and creeps inward as the song plays. Clicking the record pauses or resumes. The dial stays open while the pointer is on the record or the dial, and closes shortly after it leaves both. The groove reflection follows the cursor only while playing. Once a song is actually playing (not before), a small round play/pause key appears beside the record (hidden while the dial is open), the easy way to stop. When a song ends, side A shuffles on: every song plays once before any repeats. Each time the song changes, a small frosted "NOW PLAYING" card slides in under the record for 4 s. Reopening the dial shows the playing song: its cover keeps a bright rim, the others dim slightly, and the side card reads "NOW PLAYING" (or "PAUSED") until you hover another cover. Songs and covers live in `TRACKS` in `theme.js` and `images/covers/`.
- the bar is transparent at the top; a soft frosted strip fades in only after scrolling, so content passes under it cleanly

Content column, centered vertically and horizontally in the window (`zoom: 0.8` on wide screens so it fits one screen):
1. **Rounded hero photo** (1.9:1, 4:3 on phones). Swaps every 2 s, shuffled so none repeats until all have shown, never twice in a row, instant swap. Each photo framed by hand (`FOCUS` in `script.js`). Click anywhere on the page (not links/buttons, not while selecting text) to skip to the next.
2. **Intro**, Shravan's words: "student at cornell, intellectually curious about things as they come." / "i take cool photos, have a genre-bending music taste, play few instruments. this is the one place to get to know me."
3. **Links** (about, work, blog, photography, rabbit hole) on the left; profile icons stacked on the right (LinkedIn, X, YouTube Music, GitHub), right edge aligned with the photo. Icons from Simple Icons (CC0).
4. **Last line**, centered and a little larger: just "*opticsbyshrvn*" (Instagram, underlined). Pointing at it fades in a thin drawn arrow (SVG, same on every device) at its top right and a note underneath: "for if you have taste". On phones and tablets (no hover) both stay visible. The word "opticsbyshrvn" switches to a different display font every 2 s, at the same moment as the photo changes (on other pages, on its own 2 s timer), shuffled so every font shows once before any repeats (the font set in "Font library" below, loaded only for those letters) to invite a click; it stays still for reduced-motion users.

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
- **Banner:** muted slate teal mixed from the page color, thin rim, faint slowly drifting water ripples and a fine speckle of dots (light in dark mode, soft blue on cream; idea from ronaldleung.co), "Work" and a one-line subtitle in the normal text colors.
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
A faint field of small letters (EB Garamond, in the text color) covers the whole window behind every page, drawn with WebGL by `field.js`. A few letters twinkle. Near the cursor the letters dissolve in a grainy circle; a click sends a ripple outward that brightens and scrambles letters on its wave (the same click changes the photo). A subtle shore along the bottom edge: a faint, realistic shoreline from above: creamy white foam at the edge, pool-blue water (lighter near the edge, deeper further out) with a faint drifting net of light lines like the floor of a pool (caustics, drawn per pixel), low opacity sits at the bottom of the page (not the window, so on long pages it appears as you scroll to the end) and surges up quickly (~1.3 s) and drains back slowly (~3.5 s), with each stretch of shore and each wave a little different, like a beach seen from above, nearly invisible behind the writing. Moving the cursor over the water drops small ripples that spread across it (the hover circle doesn't erase the water). Not shown for reduced-motion or without WebGL. Inspired by contentarchitecture.dev, written from scratch.

## Motion
Deliberate, limited motion: hero photo rotation, the letter field and shore (every page), the light switch lever, the spinning record and tonearm, link hovers, and later the blog hover image, work banner grain and film roll. All of it stops for reduced-motion users.

## Not doing
- Horizontal scroll storytelling
- 3D illustrations
- A floating nav dock
- A quote on the home page (for now)
