# Changelog

Every change that reached the live site, newest first, with what it replaced and how to undo it.
Each entry names the pull request (PR) and the commit on `main` just before it, so the site can
be returned to how it looked.

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
