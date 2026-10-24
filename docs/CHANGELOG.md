# Changelog

Every change that reached the live site, newest first, with what it replaced and how to undo it.
Each entry names the pull request (PR) and the commit on `main` just before it, so the site can
be returned to how it looked.

## How to revert
- **Undo one change (recommended):** open its PR on GitHub and click **Revert** at the bottom.
  GitHub makes a new PR that undoes exactly that change; merge it and the site updates in about a
  minute. Later changes stay.
- **See how the site looked before a change:** open
  `https://github.com/shhravan/personal-website/tree/<commit>` with the "before" commit below,
  for example `.../tree/c8a2258`.
- **Ask Claude:** "revert #64" (or describe the change) works too.

---

## #64 · Music visualizer and staging setup
- **Before:** `c8a2258`
- **Changed:** while a song plays, the shoreline listens to it. The tide rises with loudness (up
  to ~7% of the screen), each bass beat sends an extra surge up the shore, and treble makes more
  letters twinkle. Added `_headers` so `staging.shravanlad.com` stays out of search engines.
- **Before this:** the shoreline moved on its own rhythm only, whatever was playing.
- **Files:** `theme.js` (audio analyser), `field.js` (water and twinkle), `_headers`, docs.
- **Partial undo:** the strength of each effect is one number in `field.js`: `0.07 * uLevel`
  (tide), `0.07 * surge * uBeatAmp` (beats) and `0.035 * uTreble` (twinkle). Set any to `0` to
  switch that effect off.

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
