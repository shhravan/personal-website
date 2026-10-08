# LEARNING

What each slice taught, in plain English.

## Slice 1: hello world

- **HTML** (`index.html`) is the content of a page. Tags like `<h1>` (big heading) and `<p>` (paragraph) wrap pieces of text. The `<head>` holds behind-the-scenes info (title, font, stylesheet); the `<body>` is what you see.
- **CSS** (`styles.css`) is the look. A rule like `body { background: ... }` says "style everything matching this".
- **CSS variables** (`--cream`, `--ink`) are named colors defined once in `:root` and reused with `var(--cream)`, so changing the palette later means editing one line.
- **Relative link** (`href="styles.css"`): the path is relative to the page, so it works on `shhravan.github.io/personal-website/` now and `shravanlad.com` later.
- **Font fallback** (`"EB Garamond", Georgia, serif`): if the first font can't load, the browser tries the next.
- **One narrow centered column**: `max-width` caps the width and `margin: 0 auto` centers it.

## Slice 2: home page (with the rotating hero)

- **Pages as folders.** `about/index.html` is served at `.../about/`. Every page is a folder holding an `index.html`, so URLs stay clean.
- **Relative paths with `../`.** From inside `about/`, `../styles.css` means "go up one folder, then find styles.css". That's why the same stylesheet works for every page.
- **CSS Grid** (`display: grid; grid-template-columns: 1fr 1fr`) makes two equal columns. A **media query** (`@media (max-width: 34rem)`) switches to one column on narrow screens.
- **`aspect-ratio` + `object-fit: cover`** keep the hero frame a fixed shape and crop any photo to fit, so the page doesn't jump when photos change.
- **JavaScript basics in `script.js`:**
  - an **array** (`HERO_IMAGES`) is a list of file names
  - `Math.random()` picks one
  - a `do...while` loop re-picks until it's different from the current one
  - `setInterval` runs a function every 5 seconds
  - an `Image()` object preloads the next photo so nothing flashes blank
  - a CSS class (`fading`) plus a `transition` does the fade
- **Reduced motion.** `prefers-reduced-motion` is a setting some people turn on; the script respects it by not rotating.
- **Placeholders** are clearly marked `[placeholder]` in the HTML. The real location, email, intro and photos still need to be added.

### Slice 2 follow-up: matching the reference layout
- **`clamp(min, preferred, max)`** gives the top padding a size that grows with window height but never goes below or above set limits.
- **`aspect-ratio: 3 / 1`** makes the hero a wide, short banner; a media query makes it taller on phones.
- **`text-transform: uppercase`** shows capitals on screen while the HTML stays lowercase, used for the small spaced-out "explore" label.

### Home layout, measured from the reference site
- Measuring a site you like (in the browser's inspector) beats guessing. Rishi's column is **one third of the window width** (`calc(100vw / 3)`), with the space above the photo about **18% of the window height** (`calc(100vh / 5.5)`).
- We keep ours from getting too small or big with `clamp(20rem, 33.333vw, 32rem)`.
- A **modifier class** (`<main class="home">`) lets only the home page use that narrow column, while other pages keep their own width.
- An **8px spacing scale** (8, 16, 24, 32, 60) keeps gaps consistent: 24px under the photo, 16px between columns.
- Garamond has a smaller x-height than Inter, so it looks smaller at the same font size. That is why our body text is about 18px where his is 16px.

### Links, dark mode and emails
- **Link style.** `a { color: var(--link); text-decoration: underline; transition: color 0.2s }` plus `a:hover { color: darker }` gives blue links that ease to a darker blue when you point at them.
- **Light and dark with CSS variables.** Every color is a variable (`--bg`, `--ink`, ...). Dark mode only redefines the variables, so none of the other rules change. `@media (prefers-color-scheme: dark)` follows the device; `:root[data-theme="dark"]` is the manual switch.
- **`theme.js` in the `<head>`.** It runs before the page is drawn, so the right theme is already set and you never see a flash of the wrong one. The button remembers your choice in **`localStorage`**, the browser's small per-site memory.
- **`data-` attributes** (`data-user`, `data-domain`) store small pieces of information in the HTML. script.js joins them into a `mailto:` link, so the full address never sits in the page text for simple bots to read.
- **No bullets:** `list-style: none` on the nav list.

### Instant photo swap
- To remove the fade, the CSS `transition: opacity` and the `fading` class are gone, and the script simply sets `img.src = next` once the next photo has loaded in the background (`new Image()` preloads it). Preloading is what stops a blank flash even without a fade.
- `<em>` inside a link makes italic text that is still clickable.

### Click to change the photo
- **Functions** (`showNext`, `startTimer`, `skip`) give a name to a chunk of work so it can be reused from the timer and from a click.
- **`addEventListener("click", ...)`** runs code when the visitor clicks. `clearInterval` + `setInterval` restarts the 2-second countdown so a click isn't followed by an instant automatic change.
- **Keyboard access:** `role="button"`, `tabindex="0"` and a `keydown` handler for Enter and Space let people without a mouse use it too.

### Space below the last line
- A page needs breathing room at the bottom as well as the top. `padding: 0 0 4rem` on the home column leaves 64px under the last line, and a bigger gap above it (`margin-top: 2.5rem`) separates the sign-off from the links. Roughly: more space between groups than within them.

### Preparing photos for the web
- **File size matters.** A 2.7 MB photo is far bigger than needed for a 512px-wide frame. Resizing to about 1600px wide and saving as JPEG at quality ~80 cut the hero folder from 17.9 MB to 4.7 MB with no visible loss.
- **Web-safe file names:** lowercase letters, numbers and hyphens, no spaces or symbols, so links never break.
- **Hidden metadata (EXIF)** in photos can include camera model and sometimes GPS location. Re-saving strips it, which matters on a public site.
- **Keep the original name different from the new one** when converting: I once overwrote an original by reusing its name, then deleted it in cleanup. Git still had the original, which is why every change goes through git.

### Shuffling, click zones, and invisible controls
- **Shuffle like a deck of cards** (Fisher-Yates): walk the list from the end and swap each item with a random earlier one. Showing the whole shuffled list before reshuffling means every photo appears once per round, and a check at the seam stops the same photo appearing twice in a row.
- **Preloading ahead:** quietly downloading the next two photos (`new Image().src = ...`) lets each swap at one per second be instant.
- **`e.target`** is the exact element that was clicked. Comparing it (the page, the body or `main` means "empty space"; `closest("a")` means "inside a link") lets one click mean different things in different places.
- **Hidden but accessible:** the theme button is clipped to 1 pixel so you cannot see it, but it still exists, so keyboard and screen-reader users can Tab to it (it becomes visible on focus).
- **Testing tip:** an automatic timer can make tests lie. I turned rotation off (reduced-motion mode) to test clicks alone.
