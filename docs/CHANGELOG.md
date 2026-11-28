# Changelog

Every change that reached the live site, newest first, with what it replaced and how to undo it.
Each entry names the pull request (PR) and the commit on `main` just before it, so the site can
be returned to how it looked.

## Outside links open in a new tab
- **Before:** `3d72a57`
- **Changed:** every link that leaves the site now opens in a new tab (with `rel="noopener"`, so the new tab can't control this one): the `opticsbyshrvn` footer link on every page, the projects tile, and the five profile icons (GitHub, LinkedIn, X, YouTube Music, Substack). The site's own links keep their quick in-page navigation, so moving between pages doesn't reload. A test fails if a future outside link forgets it.
- **Files:** the 7 pages with the footer, `projects/index.html`, `theme.js`, `tests/test_site.py`, cache numbers.
- **To revert:** restore those from `3d72a57`.

## Cans: symmetric, words always readable
- **Before:** `97a7b1c`
- **Changed:** both cans now start at exactly the same angle and height, so the pair is symmetric (before, the second was turned half a radian further, so only one showed its slot and the tongue could cover part of FILM or CLIENT). The lockup is centred on the front of each can. Dragging only tilts them (up to about 35°) and they swing back to facing front when let go, so the barcode side and the cut-off words can't be left on show. A gentle matching sway when idle.
- **Files:** `photography/cans.js`, `script.js`, cache numbers, DESIGN.
- **To revert:** restore those from `97a7b1c`.

## De-slop pass
- **Before:** `e78e172`
- **Changed:**
  - `styles.css`: removed styling for designs no page uses any more (the film-strip home, the first photography layout); each component (top links, photography tabs, cans, viewfinder, photo card, projects) is now styled in one place instead of several patches; 1158 → 1078 lines. Home, photography, blog and rabbit holes are pixel-identical before and after.
  - The text colour's transparencies are three named shades (`--wash`, `--line`, `--faint`) instead of 19 different percentages.
  - `script.js`: removed the unused home film-strip start-up.
  - A test fails if the pages ask for different versions (`?v=`) of the shared files.
  - Work and projects: title boxes without the border; lowercase titles ("work", "projects", "get in touch"); the generic subtitles are gone.
  - Projects: the tile note back in Garamond italic (no typewriter font).
- **Files:** `styles.css`, `script.js`, `work/index.html`, `projects/index.html`, `tests/test_site.py`, cache numbers, DESIGN.
- **To revert:** restore those from `e78e172`.

## "roll again"; alignment pass
- **Before:** `e607897`
- **Changed:** the photography prompt after a pick reads "roll again". Projects on phones: the GitHub count stays on one line beside its icon. Photography: the hidden can names no longer take up room.
- **Files:** `photography/index.html`, `styles.css`, cache numbers, DESIGN.
- **To revert:** restore those from `e607897`.

## Viewfinder prompts, cleaner film, aligned links, phone pass
- **Before:** `4b9a47d`
- **Changed:**
  - Photography: "pick a roll" and "another shot" (was "pick another roll") are framed like a camera viewfinder: corner brackets, an exposure readout above and a blinking red dot.
  - The FILM GALLERY / COMMERCIAL names under the cans are gone (the cans say FILM and CLIENT); they stay for keyboards and screen readers.
  - The pouring film is evenly shaded on both sides, so no stretch turns pale or washed-out; the develop no longer flashes white; on phones the film is sized to the screen.
  - Top links sit exactly on the centre line (the letter-spacing after the last letter is balanced).
  - Phones: prompt and can sizes tuned, tighter space above the strips.
- **Files:** `photography/index.html`, `photography/cans.js`, `styles.css`, `script.js`, cache numbers, DESIGN.
- **To revert:** restore those from `4b9a47d`.

## Intro on every load; cans on every visit; film flows from the slot; bigger prompts
- **Before:** `fd97c8c`
- **Changed:**
  - Home: the opening photo burst plays every time the site is loaded or reloaded on home (not when you click back to home from another page).
  - Photography: every visit starts on the two cans.
  - The film now continues out of the can's slot: the tongue sticking out is replaced by the pouring film, which leaves the slot at the tongue's width and angle, then widens and curves into the first sweep.
  - "pick a roll" and "↺ pick another roll" are much larger.
- **Files:** `script.js`, `photography/cans.js`, `styles.css`, cache numbers, DESIGN.
- **To revert:** restore those from `fd97c8c`.

## Photography: calmer pour in long sweeps
- **Before:** `2ebe1ba`
- **Changed:** the film now lands in a few long, gently curving sweeps across the page (turning round just past the edges) instead of a tangle of loops; it's a little wider, so fewer passes cover everything. Each new stretch is drawn over the film already down, so strips stack instead of cutting through each other. Softer landing at the tip, gentler twist, photos always upright (right-to-left sweeps show the film from the back). The sweeps straighten straight into the gallery rows.
- **Files:** `photography/cans.js`, `script.js`, DESIGN.
- **To revert:** restore those from `2ebe1ba`.

## Photography: slower, realer pour with the photos on the film; centred photo card; no strip gaps
- **Before:** `bb28955`
- **Changed:**
  - The pour takes about 3 seconds (4.5 with the settle): the film carries that set's own photos, is laid from the can outward and stays where it lands (no more sliding along like a conveyor), and each new stretch drops onto the pile and settles.
  - "pick a roll" and "↺ pick another roll" sit on top in larger pixel type; the cans are bigger and centred as a pair; on the landing the icons and sign-off sit low, near the water.
  - The photo card is centred (it now lives outside the page column, which is drawn at 80% on desktop).
  - The strips no longer show thin gaps where one frame meets the next.
  - Projects: the one-line notes are in Courier Prime, a typewriter face.
- **Files:** `photography/cans.js`, `script.js`, `styles.css`, `projects/index.html`, cache numbers, DESIGN.
- **To revert:** restore those from `bb28955`.

## Photography: back to the cans, smoother pour
- **Before:** `1a43eb3`
- **Changed:**
  - A "↺ pick another roll" button under the small cans goes back to the two big cans; picking again plays the pour again.
  - The pour is smoother: its 3D setup is prepared while the cans are on screen (no stutter at the click), the film uses a lighter material and fewer, evenly spaced points, nothing is allocated while it moves, the cans stop drawing while the film covers them, and it runs at a steady eased speed over 2 seconds.
- **Files:** `photography/cans.js`, `photography/index.html`, `styles.css`, `script.js`, cache numbers, DESIGN.
- **To revert:** restore those from `1a43eb3`.

## Photography film cans; opening shortened; simpler top links
- **Before:** `40211cd`
- **Changed:**
  - Photography: the page opens on two 3D film cans (Pantone 1235 C yellow, "SHRVN FILM" and "SHRVN CLIENT" in a heavy grotesk, black caps) named FILM GALLERY and COMMERCIAL. Hover lifts a can, dragging turns them. Picking one pours black-and-white film out of it until the page is buried, then the film pulls taut through the rows and the photos develop in. The cans then sit small at the top as the switch; switching later just develops the other set in. The pour plays once per visit (then you go straight to your roll), has a skip button, and never runs for reduced motion. Without 3D the page falls back to the plain tabs.
  - Photography: Film Gallery and Commercial as straight drifting strips (alternate rows run opposite ways); up/down scrolling on a strip scrolls the page. Rolls, photos and the commercial project are placeholders.
  - Home: the opening burst is about 4 seconds.
  - Top links: home appears on every page except home; blog and rabbit holes are left out until they're live (their pages still open from a direct link and are hidden from search engines); no "home / page" breadcrumbs.
  - Link previews only on the work page, and never on the top links or the icon row. Projects: the GitHub count ends in the GitHub icon.
  - Light or dark follows the device's setting unless the visitor chose one.
- **Files:** `photography/index.html`, `photography/cans.js`, `vendor/` (three.js 0.160.0, MIT), `script.js`, `theme.js`, `field.js`, `styles.css`, `projects/index.html`, `work/index.html`, `rabbit-hole/index.html`, `tests/test_site.py`, cache numbers, docs.
- **To revert:** restore those from `40211cd` and delete `photography/cans.js` and `vendor/`.

## Photo viewer card, roll stops on tap, tighter spacing, nav part of the top bar, blog private
- **Before:** `d36dde4`
- **Changed:**
  - Photography: tapping a photo on the rolling strip stops the strip and opens it; the strip rolls again when the photo closes. The viewer is a dark card: the photo, its title, place and year underneath, frame number and film stock on the right; rounded back and arrow buttons. Details are placeholders.
  - Less empty space: smaller gaps under the top bar, under the breadcrumb, between sections and above the water.
  - The section links are sized with the top bar, so zooming the browser leaves the whole bar as it is.
  - The rise-in effect is only on the work page.
  - Blog: grey in the links (not linked) and hidden from search engines, until it's ready.
- **Files:** `styles.css`, `script.js`, `theme.js`, `photography/index.html`, `blog/index.html`, cache numbers.
- **To revert:** restore those from `d36dde4`.

## Large hero with an opening sequence; photography rolls; blog list; site polish
- **Before:** `34926a2` (the film-strip home is kept on `backup/home-film-strip`)
- **Changed:**
  - Home: the large hero photo is back (changing every 1.5 s), opened on the first visit by a ~5 s burst of 24 photos that shrinks into the frame; "skip" bottom right; never for reduced motion. On phones the icons and opticsbyshrvn sit low, above the water.
  - Photography: rolls along the top; choosing one puts its photos on a calmer film strip and shows its contact sheet. Any photo (sheet or strip) opens large over a darkened page; ← back, Esc or the backdrop closes it, arrows move through the roll. Rolls and captions are placeholders.
  - Blog: one list of everything written (title, date), notes and Substack essays together, with a side column (subscribe, and a "distilled" placeholder). Each note gets its own page; notes can hold pictures.
  - Projects: just the shravanlad.com tile for now.
  - Everywhere: "home / page" breadcrumb in pixel type instead of "← home"; every section in the top links goes to its page; Substack icon added; pages fade in gently on change.
- **Files:** every page, `script.js`, `theme.js`, `styles.css`, `field.js`, `scripts/build_notes.py`, `scripts/substack_sync.py`, `tests/test_notes.py`, `.github/workflows/notes.yml`, `notes/`, docs.
- **To revert:** restore from `34926a2`, or from `backup/home-film-strip` for the film-strip home.

## Projects gallery and a blog notebook
- **Before:** `a651efd`
- **Changed:**
  - Projects: the full GitHub contribution graph across the column under the banner, then the projects as a two-column gallery (picture, name, year, one italic line; one column on phones). New screenshot of the live site for its tile.
  - Blog: water banner, then a **Notebook** of short notes (newest first) and **Essays** (the Substack posts). Notes are files in `notes/` (`YYYY-MM-DD-words.md`, see `notes/README.md`); a GitHub job (`.github/workflows/notes.yml`) runs `scripts/build_notes.py` when one changes. Links in notes work, including to the site's own pages. Visitors see no writing controls.
- **Files:** `projects/index.html`, `blog/index.html`, `notes/`, `scripts/build_notes.py`, `tests/test_notes.py`, `.github/workflows/notes.yml`, `images/projects/`, `script.js`, `styles.css`, cache numbers, DESIGN, TECH_RULES.
- **To revert:** restore those from `a651efd`; delete `notes/`, the notes script, test and workflow.

## Lower Claude Code token use in cloud sessions
- **Before:** `40211cd`
- **Changed:** nothing on the site. Claude Code now summarises chats at 200k tokens and no longer loads claude.ai connectors (Figma, Gmail and others) in this repo.
- **Files:** `.claude/settings.json`.
- **To revert:** delete that file.

## Claude Code skills available in cloud sessions
- **Before:** `ee65289`
- **Changed:** nothing on the site. Added 68 Claude Code skills under `.claude/skills/` so `/skill-name` works in cloud sessions, which can't see the skills on Shravan's Mac. Sources and licences are in `.claude/THIRD_PARTY_SKILLS.md`.
- **Files:** `.claude/skills/`, `.claude/THIRD_PARTY_SKILLS.md`, `tests/test_site.py` (skills are not site pages).
- **To revert:** delete those two paths.

## Film strip only stops when you tap it; no arrow on opticsbyshrvn
- **Before:** `c6d1da4`
- **Changed:** the film strip keeps rolling under the mouse and when you click elsewhere on the page. A click or tap on the strip itself stops it (wave and all); another starts it again. Drag, swipe and trackpad still move it. The small arrow next to opticsbyshrvn is gone on every page.
- **Files:** `script.js`, `styles.css`, every page, cache numbers.
- **To revert:** restore those from `c6d1da4`.

## New share video and picture
- **Before:** `949e792`
- **Changed:** shared links show the new home page again: `images/og/home-loop.mp4` (1200×630, 6.5 s, steady 30 fps, silent, loops with a short fade) where apps play video, and a new `images/og/home.jpg` everywhere else. Recorded frame by frame so it's smooth; record dial closed. On short windows the film strip is now a bit smaller so it clears the section links.
- **Files:** `images/og/`, every page's `<head>`, `script.js`, cache numbers on every page.
- **To revert:** restore those from `949e792`.

## Projects page (P7) with a live GitHub graph
- **Before:** `56008b1`
- **Changed:** the projects page uses the work page's ledger layout. An "Activity" section shows the last year of GitHub contributions as squares in the site's ink colour (five strengths, works in light and dark), with the total and a link to github.com/shhravan. Below it, each project is a row that opens to show problem / built / result / links. A nightly GitHub job (`.github/workflows/github-contributions.yml`, 03:23 UTC) refreshes `data/github.json`. Project wording is placeholder where marked.
- **Files:** `projects/index.html`, `script.js`, `styles.css`, `scripts/github_contributions.py`, `.github/workflows/github-contributions.yml`, `data/github.json`, cache numbers on every page, DESIGN, TECH_RULES.
- **To revert:** restore the page, script and styles from `56008b1`; delete the workflow, script and `data/`.

## Record dial no longer pops open when you come back
- **Before:** `3cee5fa`
- **Changed:** leaving the site (switching tab or app) closes the desktop record dial, and on return it only opens once you actually move the pointer onto the record.
- **Files:** `theme.js`, cache numbers on every page.
- **To revert:** restore those from `3cee5fa`.

## Section links stay at the top
- **Before:** `af73045`
- **Changed:** the section links stay fixed at the top while scrolling, like the switch, name mark and record. The frosted strip behind the top bar is taller so text passes cleanly underneath.
- **Files:** `styles.css`, cache numbers on every page.
- **To revert:** restore those from `af73045`.

## Trackpad swipes, even nav spacing, smoother on phones
- **Before:** `f973ad9`
- **Changed:** a two-finger trackpad swipe (or mouse wheel) on the home page moves the film strip with the swipe's own speed and glide, then it eases back to its normal roll. Inner pages now start at the top, so the gap under the section links is the same on every page. The links are a little bigger on phones. The film strip draws less per frame on phones, so it moves more smoothly.
- **Files:** `script.js`, `styles.css`, cache numbers on every page.
- **To revert:** restore those from `f973ad9`.

## Film strip rolls slower, all in colour
- **Before:** `461b621`
- **Changed:** every frame is in colour (no black-and-white frames), and the steady roll is about half as fast (one frame every 3 seconds, 2.4 with music), and swipes fling it less far and settle sooner.
- **Files:** `script.js`, cache numbers on every page, DESIGN.
- **To revert:** restore those from `461b621`.

## Film strip rolls; sections and icons on every page
- **Before:** `2247415`
- **Changed:** the film strip now rolls steadily instead of jumping frame to frame, and a swipe flings it (fast, then easing back to its normal roll). The section links along the top and the profile icons above opticsbyshrvn now appear on every page, not just home. The links are just words (no line in front, no underline). No link previews on the home page. Inner pages start a little lower to make room for the links.
- **Files:** `script.js`, `theme.js`, `styles.css`, `index.html`, cache numbers on every page, DESIGN.
- **To revert:** restore those from `2247415`.

## Home page: the film strip
- **Before:** `793a3fd` (also kept whole on the branch `backup/site-before-film-strip`)
- **Changed:** the home page is now a cover. The sections run along the top in pixel type; a roll of film with the photos waves across the middle and glides to the next frame every 1.5 seconds (faster while music plays), with the middle frame in colour; the profile icons and opticsbyshrvn sit centred at the bottom above the water. Drag, swipe, tap, click or use the arrow keys to move it. The intro list and the single rotating photo are gone, and the letters behind the home page are no longer faded.
- **Files:** `index.html`, `script.js`, `styles.css`, `field.js`, cache numbers on every page, PRD, DESIGN, TECH_RULES.
- **To switch back to the old site:** restore everything from `backup/site-before-film-strip` (or `793a3fd`), e.g. `git checkout backup/site-before-film-strip -- .` on a new branch, then open a PR.

## Pixel font for every label
- **Before:** `1dfc041`
- **Changed:** the Silkscreen pixel font was only loaded for the letters O, N and F (the light switch), so other small-caps labels mixed fonts (only the N was pixelated). The whole font now loads, so About, Experience, Education, Honors, the record readout and the phone sheet labels are all in the pixel font. Section labels are a touch bigger.
- **Files:** `theme.js`, `styles.css`, cache numbers on every page.
- **To revert:** restore those from `1dfc041`.

## Faded area covers only the writing
- **Before:** `be1eb7e`
- **Changed:** the softer letters behind the page now start at the first line ("← home") as well as ending at the last, so the area around the name mark at the top and the water at the bottom are both at full strength.
- **Files:** `field.js`, cache numbers on every page.
- **To revert:** restore those from `be1eb7e`.

## Water no longer faded under the page column
- **Before:** `7976a4b`
- **Changed:** the softer area behind the text now ends at the last line of writing instead of the column's bottom padding, so the water at the bottom is the same strength all the way across (it used to look washed out in a band under the column).
- **Files:** `field.js`, cache numbers on every page.
- **To revert:** restore those from `7976a4b`.

## Breathing room on inner pages
- **Before:** `b236a5a`
- **Changed:** inner pages (work, projects, blog, photography, rabbit holes) have more space under the top bar before "← home", and enough space at the bottom that the last line always ends above the water instead of running into it.
- **Files:** `styles.css`, cache numbers on every page.
- **To revert:** restore those from `b236a5a`.

## Work page ledger (W5); phone record sheet tidies itself away
- **Before:** `b5cd625`
- **Changed:**
  - Work: the boxes are gone. Each section is set off by a thin rule with its name in small caps in a left margin (above the section on phones), and the column is wider on desktop. Content and features are unchanged.
  - Phone record sheet: no big vinyl in the sheet any more (the small record in the corner is the player). Tap a cover to play it, tap the playing one to pause. Once a song is picked the sheet slides down by itself after 5 seconds; touching or swiping it restarts the wait. Tap the small record to bring it back.
- **Files:** `work/index.html`, `theme.js`, `styles.css`, cache numbers on every page, DESIGN.
- **To revert:** restore those from `b5cd625`.

## Work: Cornell seal back on Honors, more link previews
- **Before:** `ecc37a3`
- **Changed:** the Cornell seal shows on each Honors row again (it was shown once, under Education). New hover preview for AM/NS India (`amns.in`, taken by hand past its video and pop-up); the other previews were retaken fresh. Still no preview for the Aditya Mittal page, Forbes and Cornell Information Science (they block automated browsers) or social sites.
- **Files:** `work/index.html`, `images/previews/`, `scripts/capture_previews.cjs`, cache numbers on every page.
- **To revert:** restore those from `ecc37a3`.

## Work: hovering a name shows its preview too
- **Before:** `8d89616`
- **Changed:** on the work page, pointing at an organisation's name or role shows the same website preview card as pointing at its logo (only for entries whose logo links to a site). Clicking the name still opens and closes the entry.
- **Files:** `theme.js`, cache numbers on every page.
- **To revert:** restore those files from `8d89616`.

## Phone record: cancel the swipe from its very first move
- **Before:** `5d350c8`
- **Changed:** the sheet now blocks the page's own scroll from the very first finger movement (it used to wait about 6px, by which point iPhone had already started pull-to-refresh). The pinned page also gets `touch-action: none` and `overscroll-behavior: none` while the sheet is open.
- **Files:** `theme.js`, `styles.css`, cache numbers on every page.
- **To revert:** restore those files from `5d350c8`.

## Phone record: swiping down really stops reloading on iPhone
- **Before:** `3afb142`
- **Changed:** while the record sheet is open the page underneath is pinned in place, and every downward drag (including on the cover row and the dimmed page) is kept by the sheet, so iPhone Safari's pull-to-refresh can't fire. Sideways swipes on the covers still scroll. Closing puts the page back where it was.
- **Files:** `theme.js`, `styles.css`, cache numbers on every page.
- **To revert:** restore those files from `3afb142`.

## Phone record: play key, and swiping down no longer reloads
- **Before:** `8cb0752`
- **Changed:** dragging the record sheet down closes it instead of triggering the browser's pull-to-refresh. Once a song is playing, a small play/pause key sits just left of the small record (like the desktop one), so pausing doesn't need the sheet.
- **Files:** `theme.js`, `styles.css`, cache numbers on every page.
- **To revert:** restore those files from `8cb0752`.

## Record sheet on phones
- **Before:** `6a162ec`
- **Changed:** on phones and tablets, tapping the small record now opens a sheet from the bottom (it used to play a random song). The sheet has the same vinyl and cream label as the desktop deck, a now-playing card, and a row of all 15 covers to swipe. Tap a cover to play it; tap the record to pause or play. Close by swiping down, tapping above the sheet, tapping the small record or pressing Escape. Desktop is unchanged.
- **Files:** `theme.js`, `styles.css`, cache numbers on every page, docs.
- **To revert:** restore `theme.js`, `styles.css` and the pages from `6a162ec`.

## How to revert
- **Undo one change (recommended):** open its PR on GitHub and click **Revert** at the bottom.
  GitHub makes a new PR that undoes exactly that change; merge it and the site updates in about a
  minute. Later changes stay.
- **See how the site looked before a change:** open
  `https://github.com/shhravan/personal-website/tree/<commit>` with the "before" commit below,
  for example `.../tree/c8a2258`.
- **Ask Claude:** "revert #64" (or describe the change) works too.

---

## Type scale, cleaner links, quieter background
- **Before:** `632be69`
- **Changed:**
  - Clear sizes on every page: titles ~40px, section headings ~22px, body ~17px (was ~15px). Grey text is brighter, and the letter field is quieter behind the text.
  - List links (home sections, "← home") have no underline; pointing at one draws a short line in front of it. Links inside sentences keep their underline.
  - Home: the intro text is gone; projects, blog, photography and random rabbit holes show "soon" and aren't links yet; profile icons sit in one row under the list.
  - Work: the Cornell seal shows once (Honors rows keep an empty space instead); the Essar note is one line.
- **Files:** `styles.css`, `field.js`, `index.html`, `work/index.html`, cache numbers on every page, docs (`CLAUDE.md` now asks for design advice on UI work).
- **To bring the intro back:** see `index.html` at `632be69`.

## Light rays and share video removed
- **Before:** `29a02f2`
- **Changed:** the light rays around the name mark are gone (the name stays still; the shoreline and record deck carry the motion). Shared links no longer offer the video loop; they still show the `home.jpg` picture.
- **Why:** less competing motion, and the recorded loop was choppy (~7 real frames a second). A smooth recording will come back later.
- **Files:** `theme.js`, `styles.css`, every page's `<head>`, `images/og/home-loop.mp4` (deleted), tests, docs.
- **To bring them back:** revert this PR.

## Light rays point toward the cursor
- **Before:** `366c90c`
- **Changed:** the rays (and the shadow in light mode) now stream toward the cursor instead of away from it.
- **Files:** `theme.js` (one line: the light's position flips to the side away from the cursor).

## Share previews (og:image, og:video)
- **Before:** `94b6857`
- **Changed:** sharing any page now shows a picture of the home page, and apps that support it play a ~10 s silent loop of the home page. Each page has its own title and description (section pages had no description before); blog posts get their own title, subtitle and address.
- **Before this:** shared links showed only a plain title.
- **Files:** the `<head>` of every page, `images/og/`, `scripts/substack_sync.py`, tests, docs.

## Link previews; photo-address fix
- **Before:** `a201b3a` (same PR as the light rays)
- **Changed:** hovering a link shows a small screenshot of where it goes, gliding after the cursor. 13 links have one (own pages and outside sites; not social profiles). Also fixed hero photos being requested from the wrong folder (`/work/images/hero/...`, 404s) during a page swap.
- **Files:** `theme.js` ("link previews" section), `styles.css` (`.link-preview`), `images/previews/`, `scripts/capture_previews.cjs`, `script.js` (photo addresses), docs.
- **Partial undo:** delete `images/previews/index.json` and no cards appear.

## Light rays around the name mark
- **Before:** `a201b3a`
- **Changed:** while the mouse moves, light rays fade in behind the name mark and glide toward the cursor, fading out about a second after it stops; light in dark mode, a soft dark shadow in light mode. Nothing shows at rest.
- **Before this:** the name mark had no glow.
- **Files:** `theme.js` ("light rays around the name mark" section), `styles.css` (`.logo-glow`), docs.
- **Tuning:** in `theme.js`, `0.065` / `0.045` set the strength in dark / light mode, `N = 40` with `0.032` sets how far the rays reach, and `900` (ms) is how long they linger after the mouse stops.

## Substack sync: log retries
- **Before:** `fadcbd0`
- **Changed:** when Substack says "slow down" (HTTP 429) or "busy" (503), the job log now says which address and how long it waits, so a slow or failed run explains itself.
- **Files:** `scripts/substack_sync.py`, tests.

## Substack sync hardening
- **Before:** `25b1295`
- **Changed:** the sync now keeps its own monthly schedule switched on (GitHub disables idle scheduled jobs after 60 days, which would have silently stopped it before your first post), uses current versions of GitHub's checkout and Python steps (the old ones run on a retiring Node 20), and has a `--limit` option for testing. Verified end to end against a real public Substack: posts, images and pages all correct.
- **Before this:** the job would have stopped running after ~60 quiet days, and warned about Node 20 on every run.
- **Files:** `.github/workflows/substack.yml`, `.github/workflows/tests.yml`, `scripts/substack_sync.py`, tests, docs.

## #65 · Visualizer removed; CHANGELOG added
- **Before:** `ade895a`
- **Changed:** the music visualizer from #64 is gone (it made the water flicker). `theme.js` and
  `field.js` are back to exactly how they were before #64 (`c8a2258`); the shoreline moves on its
  own rhythm again. Staging setup from #64 stays. Added this changelog.
- **Before this:** the water and letters reacted to the playing song.
- **To bring the visualizer back:** its full code is in #64 (commit `ade895a`).

## #64 · Music visualizer and staging setup
- **Before:** `c8a2258`
- **Changed:** while a song plays, the shoreline listens to it. The tide rises with loudness (up
  to ~7% of the screen), each bass beat sends an extra surge up the shore, and treble makes more
  letters twinkle. Added `_headers` so `staging.shravanlad.com` stays out of search engines.
- **Before this:** the shoreline moved on its own rhythm only, whatever was playing.
- **Files:** `theme.js` (audio analyser), `field.js` (water and twinkle), `_headers`, docs.
- **Status:** visualizer removed in #65.

## #63 · Safari: dark box behind the home column
- **Before:** `a79531f`
- **Changed:** in Safari the faded area behind the photo and text was 25% too big and off to the
  side. `field.js` now measures the zoomed column correctly in both browsers.
- **Before this:** Safari showed a dark shade that didn't line up with the content. Chrome was
  unaffected.

## #62 · Self-hosted audio, song and photo tweaks, Safari deck fix
- **Before:** `d1bae88`
- **Changed:**
  - The record player plays our own MP3s from `audio/` instead of a hidden YouTube player (no
    ads). YouTube removed from the security policy.
  - Ain't No Sunshine uses the *Lean on Me* cover; *Vienna* (Billy Joel) replaced *Viva la Vida*
    (Coldplay).
  - The golden-dome hero photo was removed (28 to 27 photos).
  - Hero photos and the "opticsbyshrvn" font change every 1.5 s (was 2 s).
  - Older Safari showed the turntable at full size at rest; its scale is now set from `theme.js`.
- **Before this:** songs streamed from YouTube (with possible ads), 28 photos, 2 s timing.

## #61 · README rewrite
- **Before:** `6e15d83`
- **Changed:** a friendlier README (intro, features, run locally, tests, folder map).

## Initial commit (`6e15d83`)
The cleaned-up site: reference sites removed from code and docs, photo files renamed, docs
rewritten, old history replaced by this single commit. The older design (small record only,
before the record deck) is kept on the `backup/small-record` branch.
