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
