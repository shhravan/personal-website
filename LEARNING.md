# LEARNING

What each slice taught, in plain English.

## Slice 1: hello world

- **HTML** (`index.html`) is the content of a page. Tags like `<h1>` (big heading) and `<p>` (paragraph) wrap pieces of text. The `<head>` holds behind-the-scenes info (title, font, stylesheet); the `<body>` is what you see.
- **CSS** (`styles.css`) is the look. A rule like `body { background: ... }` says "style everything matching this".
- **CSS variables** (`--cream`, `--ink`) are named colors defined once in `:root` and reused with `var(--cream)`, so changing the palette later means editing one line.
- **Relative link** (`href="styles.css"`): the path is relative to the page, so it works on `shhravan.github.io/personal-website/` now and `shravanlad.com` later.
- **Font fallback** (`"EB Garamond", Georgia, serif`): if the first font can't load, the browser tries the next.
- **One narrow centered column**: `max-width` caps the width and `margin: 0 auto` centers it.
