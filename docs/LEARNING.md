# Learning notes

What building this site taught, in plain English. Grouped by topic, newest topics last.

## HTML and CSS basics
- **HTML** is a page's content and structure; **CSS** is how it looks; **JavaScript** adds behavior.
- **CSS variables** (`--bg`, `--ink`) define each color once. Dark mode only redefines the variables, so no other rule changes.
- **Pages as folders:** `work/index.html` is served at `/work/`, which keeps URLs clean. Links are **relative** (`../styles.css`), so the site works at any address, which made the move to `shravanlad.com` a one-file change.
- **Layout:** flexbox (`justify-content: space-between`) pushes dates to the right edge; CSS grid makes equal columns; media queries switch layouts on phones. `clamp(min, preferred, max)` lets sizes grow with the window within limits.
- **`aspect-ratio` + `object-fit: cover`** keep the hero frame a fixed shape; `object-position` and `transform: scale()` choose which part of each photo stays in view.
- **Sizes in `vw`** stay the same on screen when the browser zooms, which keeps the top bar steady.
- **`<details>` / `<summary>`** give expandable rows with no JavaScript.
- **Cache-busting:** browsers keep old copies of CSS and JS; a `?v=` number on each link forces a fresh download when it changes.

## JavaScript
- **Shuffle bag** (Fisher–Yates): shuffle the list, deal it out, reshuffle only when empty. Every item shows once before any repeat; a check at the seam prevents back-to-back repeats.
- **Preloading** the next photos with `new Image()` makes swaps instant.
- **`localStorage`** remembers the theme choice; `theme.js` runs in the `<head>` so the right theme is set before the page draws (no flash).
- **`data-` attributes** hold the email's parts; `script.js` joins them, so the full address never sits in the page source for simple bots.
- **In-place page swaps:** a normal link click reloads everything, stopping the music. Instead, `fetch` loads the next page, its `<main>` is swapped in, and `history.pushState` updates the address bar so back, forward and bookmarks still work. Page code re-initializes on a custom `page:load` event.
- **Web Audio** synthesizes the switch click (a short filtered noise burst plus a falling tone), so there is no audio file to download.

## Accessibility
- `role="switch"` + `aria-checked`, `aria-pressed` and `aria-label` tell screen readers what controls do and how they're set.
- Keyboard support: real `<button>`s, focusable controls, Enter/Space handlers.
- `prefers-reduced-motion` turns off rotation, the letter field and other motion.
- Tap targets get padding so small icons are easy to hit.

## Fonts and images
- Font weights are separate files; request the real bold instead of letting the browser fake it.
- Google Fonts' `&text=` option downloads only the listed letters, which keeps the ten display fonts and the Devanagari name tiny.
- `font-family` is a fallback list: the browser uses the first font that has each character.
- Images: WebP is about half the size of JPEG; phones get a 700px version. Re-saving strips EXIF metadata (camera, sometimes GPS), which matters on a public site.
- A logo used as a CSS **mask** takes its color from the theme, so one file works in both modes.

## The letter field (WebGL)
- **Instancing** draws one small shape thousands of times in a single call; a shader positions each copy and picks its letter from an atlas image of glyphs.
- Colors must be **pre-multiplied** by opacity for correct blending (`blendFunc(ONE, ONE_MINUS_SRC_ALPHA)`).
- The field redraws every frame only while something moves, and stops when the tab is hidden, to save battery.
- The shoreline is computed per pixel: value noise for frothy edges, a lopsided cycle (fast surge, slow backwash) and per-column offsets so each stretch of shore moves differently. Its position follows the bottom of the *page*, not the window.

## Light rays (god rays)
- "God rays" can be faked cheaply: draw a shape many times, each copy scaled up a little around a light point and fainter. The edges smear outward into streaks pointing away from the light.
- Filling an image with one color on a canvas: draw it, then set `globalCompositeOperation = "source-in"` and fill a rectangle. Only the image's shape keeps the new color.
- Using the text color (`--ink`) for the rays makes one effect serve both themes: a glow on dark, a shadow on cream.

## Share previews (Open Graph)
- Apps read `<meta property="og:...">` tags to build the card shown when a link is shared. `og:image` is used almost everywhere (1200×630 is the safe size); `og:video` is played only by some apps (Discord, Slack, iMessage sometimes), so it always goes with an image.
- These tags need full addresses (`https://shravanlad.com/...`), not relative ones, because the app reading them isn't on our site.

## Link previews
- Screenshots are taken ahead of time with an automated browser and served from our own site, so visitors' browsing isn't sent to a screenshot service and the security policy stays strict.
- Pop-ups and cookie banners spoil screenshots; the capture script clicks "accept/close" buttons and removes layers named like pop-ups. Removing every fixed element was too blunt (it wiped GitHub's profile column).
- Relative addresses (`images/hero/x.webp`) depend on the page the browser thinks it's on. During an in-place page swap the address changes first, so scripts should build addresses from their own location.

## The record deck
- The dial is one SVG; each cover is clipped to a ring-shaped slice with a `clipPath` built with a little trigonometry.
- The security policy blocks inline `style="..."`, so per-cover values are set with `style.setProperty`, which it allows.
- The groove sheen is a `conic-gradient` whose angle is a CSS variable registered with `@property`, so it can animate.
- Songs are plain MP3 files in `audio/`, played by the browser's built-in audio player (`new Audio()`), with `preload = "none"` so nothing downloads until a song plays. `#t=28` on the file's address starts it 28 seconds in.
- Phones only allow sound to start during a tap; calling `audio.play()` inside the tap handler satisfies that.
- Re-saving the MP3s at 128 kbps and stripping their tags (`ffmpeg -map_metadata -1`) cut the folder size and removed hidden details such as embedded art.

## Security
- A **Content-Security-Policy** meta tag on every page allows only the site itself and Google Fonts; injected inline scripts don't run.
- **Referrer-Policy** limits what outbound links reveal.
- Automated tests check every page for the CSP, inline code, unsafe links, exposed email addresses and secrets.

## Blog pipeline (Substack)
- Substack has no official API or webhooks, but it has an RSS feed and the JSON endpoints its own site uses. The script tries JSON first and falls back to RSS: a good habit whenever you rely on something undocumented.
- **Fetch → transform → render.** Transform means cleaning the HTML to an allowlist (scripts, embeds and buttons are dropped) and downloading images so the site doesn't depend on Substack's servers.
- A **GitHub Action** is a computer GitHub lends for a few minutes. A cron line schedules it (`17 9 1 * *` = 09:17 UTC on the 1st of each month); `workflow_dispatch` adds a "Run workflow" button. It commits only when something changed.
- A **canonical** link tells search engines which copy of a post is the original.
- A cache of each post's source means old posts aren't re-fetched every run.

## Testing
- Tests replace the network with a fake Substack that serves hostile or broken data on purpose: script injection, path-traversal slugs, fake images, XML bombs, wrong JSON shapes, empty responses.
- Check output the way a browser reads it (parse the HTML), not with text search, which gives false alarms.
- **Mutation testing:** break the safety code on purpose and confirm a test fails. Every fix in this repo was checked this way.
- Reliability tests replay every real failure (a missing folder in the commit step, rate limits on both routes) plus the next likely one (main moving mid-run), running the workflow's real commit step in throwaway git repos.

## Keeping a scheduled job alive
- GitHub switches off scheduled workflows in public repos after 60 days with no repository activity. A monthly job that usually has nothing to commit would quietly stop. Calling the "enable workflow" API at the end of each run resets the clock.
- A job that has only ever seen an empty feed hasn't proven much. Running the sync locally against a real public Substack (`--limit 4`) exercised the whole path: real API shapes, image downloads, generated pages in the browser.

## Servers, Cloudflare and the relay
- A server is an always-on computer that answers requests. GitHub Pages only hands out files; it runs none of our code.
- Cloudflare protects Substack and blocks data-centre machines like GitHub's runners. A probe workflow confirmed it.
- A **Cloudflare Worker** is a small program Cloudflare runs on its network. Ours fetches only allowlisted Substack addresses, only with a secret key, so it isn't an open proxy. The key lives only in Cloudflare and GitHub secrets.
- **HTTP 429** means "too many requests": the sync waits (10 s, 30 s, 90 s, or what `Retry-After` asks, capped at 2 minutes) and retries before giving up.

## Staging
- A staging site is a private-ish copy where changes are checked before going live. Cloudflare Pages deploys the working branch to `staging.shravanlad.com` and gives every pull request its own preview link.
- An `X-Robots-Tag: noindex` header (set in `_headers`) tells search engines not to list staging, so it never competes with the real site.

## Custom domain
- A custom domain needs two halves: DNS records at the registrar saying "this name lives at GitHub" (four A records plus a `www` CNAME), and a `CNAME` file in the repo telling GitHub Pages which name is ours.
- Multiple A records for the same name are intentional: they give redundancy across GitHub's servers.
- Safari reports a zoomed element's position at full size, while Chrome reports it as drawn. field.js detects which one it got (the column is centered, so the right answer has its middle on the window's middle) before fading the letters behind the content.
