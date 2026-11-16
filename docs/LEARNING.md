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

## The film strip
- A flat picture can look bent without any 3D library: draw it as many thin vertical slices, and move and tilt each slice to follow a curve (here a slow sine wave). Shading the slices that "turn away" sells the depth.
- Paint expensive things once and reuse them. Each film frame (photo, sprocket holes, numbers) is drawn once into its own small canvas, in colour and in black and white; every animation frame just copies slices of those.
- Anything that moves on its own needs manners: pause while someone is pointing at it, stop when the tab is hidden, and stay still for people who turn on "reduce motion".
- Before a big redesign, keep the old version on its own branch (`backup/site-before-film-strip`) so switching back is one restore, not an archaeology project.

## Film cans in 3D
- **three.js** draws 3D in the browser with WebGL. A can is a cylinder (the label, painted onto a flat canvas and wrapped round), two "turned" caps (a profile spun round an axis, called a lathe) and a spool. Lighting from a fake room (an environment map) is what makes plastic and print look real.
- **Ribbon geometry:** the pouring film is one long strip of triangles following a curve. At each point along it we work out which way is "across" the film, then twist that a little as we go, so it curls the way real film does.
- **Morphing:** every point has two homes, the loose pile and the taut rows. Sliding each point between them (with easing) pulls the pile straight. Texture coordinates sliding along the strip make the film look like it's running.
- **Loading only where needed:** `import()` fetches a module on demand, so the 670 KB library downloads only on the photography page.
- **Fonts on a canvas:** text drawn into a canvas uses whatever font is ready at that instant, so wait for the font (and its stylesheet) before painting labels, or they come out in the fallback serif.


## When GitHub Pages doesn't publish
- Merging to `main` starts GitHub's "pages build and deployment" job: it builds the site, then a deploy step publishes it. Once in a while the deploy step hangs or reports "Deployment cancelled" even though the build was fine.
- Re-running that job for the same commit can fail the same way, because GitHub already has a (stuck) deployment for that commit. A fresh commit gets a fresh deployment and goes through.
- Quick check that a change is live: the `?v=` number in the live page's source matches the one in the repo.

## The desk (a private dashboard on a static site)
- **A static host can't keep a secret.** GitHub Pages only hands out files, so a password checked in a page's JavaScript is visible to anyone who opens "view source". A real lock needs a server that decides before anything is sent. Here that's **Cloudflare Access**: a login wall run by Cloudflare, in front of a separate little site. It emails a 6-digit code and only lets one email through.
- **Defence in depth:** the server code checks the login again itself. Access attaches a signed token (a **JWT**: three base64 pieces, header, claims and signature) to every request. We check the signature with Cloudflare's public keys, then that it's for this app (`aud`), from our team (`iss`), not expired (`exp`), and for the owner's email. If Access were ever switched off by mistake, the server would still refuse.
- **Fail closed:** if any setting is missing, the answer is "no", never "everyone".
- **Git as the database.** The desk saves by making commits through GitHub's API: upload each file as a *blob*, build a *tree* (the folder listing) on top of the last one, make a *commit* pointing at it, then move the branch to it. Five calls, one tidy commit.
- **Optimistic locking:** the desk remembers which commit it started from. If the branch moved meanwhile (another tab), the save is refused instead of overwriting. Databases use the same trick with version numbers.
- **Drafts and publish are just branches.** Save goes to `drafts` (which Cloudflare previews), publish merges `drafts` into `main` (which GitHub Pages serves).
- **Do heavy work where the data is.** Photos are resized and encoded on the phone (WebAssembly runs Google's libwebp at near-native speed), so a 12 MB photo becomes about 1 MB before it's uploaded, and its GPS location never leaves the device.
- **Resizing well:** shrink in halves, then once more to the exact size. One giant jump makes fine detail shimmer (aliasing). And 2560px covers a full-screen photo on a retina laptop (1280 CSS pixels × 2).

## The same thing for many people (how it scales)
The desk is built for one person. If thousands of photographers used it, each piece would be swapped for the industry version, but the shape stays the same: **upload → process → store → serve**, plus **who are you** and **what may you do**.
- **Login:** Cloudflare Access fits one person. For many, use an identity service (Clerk, Auth0, Supabase Auth, or "sign in with Google" via OAuth) and keep the same rule: the server checks a signed token on every request.
- **Data:** git stops being a good database once many people write at once (every save is a commit, and merges conflict). Use **Postgres** (a relational database, e.g. Supabase or Neon): tables `users`, `rolls`, `photos`, and a `user_id` column on each, so every query is scoped to its owner (row-level security).
- **Files:** don't store photos in git or the database. Use **object storage** (Cloudflare R2, Amazon S3). The browser uploads straight to it with a short-lived signed upload link, so big files never pass through your server.
- **Image processing:** a queue and background workers (or a service like Cloudflare Images or imgix) make the sizes and formats (AVIF, webp) after upload, so one slow photo doesn't block anyone.
- **Serving:** a **CDN** (content delivery network: copies on servers near each visitor) in front of the storage. Public pages are cached; only the dashboard talks to the database.
- **Hosting:** the public site could stay static and be rebuilt on publish, or become server-rendered (Next.js/Astro on Vercel or Cloudflare). The API runs as serverless functions, much like the desk's Pages Function today.
- **Running it:** error tracking (Sentry), logs, rate limits per user, backups of the database, and tests that run before every deploy, as this repo already does.
- The habits that carry over from here: check permissions on the server, never trust the browser, keep secrets out of code, save atomically, and give people a preview before anything goes live.
