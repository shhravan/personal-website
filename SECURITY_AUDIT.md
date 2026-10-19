# Security audit (October 2026)

## Architecture
Static personal website: plain HTML, CSS and JavaScript in a **public** GitHub repo (`shhravan/personal-website`), served by **GitHub Pages** at `https://shhravan.github.io/personal-website/`. No server code, database, accounts, forms, file uploads, payments, build step, package dependencies, CI workflows or AI features at runtime.

```
visitor browser ──HTTPS──> GitHub Pages (static files from main)
      │
      ├── fonts.googleapis.com / fonts.gstatic.com   (fonts)
      ├── www.youtube.com, s.ytimg.com               (record player, only after a click)
      └── outbound links: LinkedIn, X, YouTube Music, GitHub, Instagram
Trust boundary: everything in the repo is public; the browser runs only first-party scripts
plus YouTube's player script.
```
Data handled: none collected. The page shows two email addresses (intentionally public) and stores one value, the light/dark choice, in `localStorage`.

## Scope and limitations
Assessed: every file in the repo, full git history, the live site's HTTP behaviour, and the running site in a local headless Chromium. Not assessable from here: GitHub account settings (MFA, sessions), repository settings (branch protection, who has write access), and GitHub Pages internals.

## Findings (by severity)
No CRITICAL or HIGH issues.

| ID | Title | Severity | Confidence | Status |
|---|---|---|---|---|
| SA-1 | No Content Security Policy | MEDIUM | CONFIRMED | **Fixed** |
| SA-2 | No Referrer-Policy | LOW | CONFIRMED | **Fixed** |
| SA-3 | Clickjacking: page can be framed (no `frame-ancestors`/`X-Frame-Options`) | LOW | CONFIRMED | Accepted: not settable on GitHub Pages; site has no sensitive actions |
| SA-4 | `main` branch protection / account MFA not verified | MEDIUM | UNVERIFIED | Needs owner action |
| SA-5 | Third-party images (film stills, band photos, album art) on a public site | INFO (legal, not security) | CONFIRMED | Owner decision |
| SA-6 | Public email addresses can be scraped | INFO | CONFIRMED | Accepted; addresses are split in HTML to deter simple bots |

**SA-1.** Without a CSP, any future XSS bug or a compromised script could load code from anywhere. Fix: a `<meta http-equiv="Content-Security-Policy">` on all six pages allowing only self, Google Fonts and YouTube; `object-src 'none'`, `base-uri 'self'`, `form-action 'none'`, `upgrade-insecure-requests`. Verified: all features still work (letter field, photo rotation, light switch, fonts, YouTube player), no violations on load; an injected inline script did **not** execute and an off-list image was blocked.

**SA-2.** Outbound clicks sent the full page URL as referrer. Fix: `<meta name="referrer" content="strict-origin-when-cross-origin">`.

## Checks that passed (evidence)
- Secrets: pattern scan of all tracked files and the full git history found no keys, tokens or private keys.
- HTTPS: `http://` redirects (301) to HTTPS; `Strict-Transport-Security: max-age=31556952` is sent.
- DOM: the only `innerHTML` uses are fixed strings in `theme.js` (switch and record drawings); no `eval`, `document.write`, `postMessage` handlers or URL-driven content.
- `window.open` uses `noopener`. No forms, cookies or user input processed.
- WebGL field and YouTube player are disabled or inert for reduced-motion users and only load YouTube after a click.

## External actions for the owner
1. Turn on MFA for the GitHub account (and for Google/Meta if the Instagram integration is built later).
2. Settings → Branches: add a protection rule on `main` (require pull requests).
3. Decide on the third-party images (SA-5).
4. When the Instagram feed is built: keep the token only as a GitHub Actions secret, never in files.
