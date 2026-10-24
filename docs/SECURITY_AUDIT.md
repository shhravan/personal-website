# Security audit (October 2026)

## Architecture
Static personal website: plain HTML, CSS and JavaScript in a **public** GitHub repo (`shhravan/personal-website`), served by **GitHub Pages** at `https://shravanlad.com`. No server code, database, accounts, forms, file uploads, payments, build step or package dependencies. A scheduled GitHub Action syncs blog posts from Substack through a keyed Cloudflare Worker relay.

```
visitor browser ──HTTPS──> GitHub Pages (static files from main)
      │
      ├── fonts.googleapis.com / fonts.gstatic.com   (fonts)
      └── outbound links: LinkedIn, X, YouTube Music, GitHub, Instagram
Trust boundary: everything in the repo is public; the browser runs only first-party scripts
only (songs are self-hosted MP3s).
```
Data handled: none collected. The site shows one email address (intentionally public, assembled by script) and stores one value, the light/dark choice, in `localStorage`.

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
| SA-6 | Public email address can be scraped | INFO | CONFIRMED | Accepted; the address is split in HTML to deter simple bots |

**SA-1.** Without a CSP, any future XSS bug or a compromised script could load code from anywhere. Fix: a `<meta http-equiv="Content-Security-Policy">` on every page allowing only self and Google Fonts; `object-src 'none'`, `base-uri 'self'`, `form-action 'none'`, `upgrade-insecure-requests`. Verified: all features still work (letter field, photo rotation, light switch, fonts, YouTube player), no violations on load; an injected inline script did **not** execute and an off-list image was blocked.

**SA-2.** Outbound clicks sent the full page URL as referrer. Fix: `<meta name="referrer" content="strict-origin-when-cross-origin">`.

## Checks that passed (evidence)
- Secrets: pattern scan of all tracked files and the full git history found no keys, tokens or private keys.
- HTTPS: `http://` redirects (301) to HTTPS; `Strict-Transport-Security: max-age=31556952` is sent.
- DOM: the only `innerHTML` uses are fixed strings in `theme.js` (switch and record drawings); no `eval`, `document.write`, `postMessage` handlers or URL-driven content.
- `window.open` uses `noopener`. No forms, cookies or user input processed.
- The WebGL field is disabled for reduced-motion users. The record player uses self-hosted audio (`media-src 'self'`); no third-party scripts or frames.
- Automated tests (`tests/`) check the CSP, inline code, link safety, secrets and workflow permissions on every push.

## External actions for the owner
1. Turn on MFA for the GitHub and Cloudflare accounts.
2. Settings → Branches: add a protection rule on `main` (require pull requests).
3. Decide on the third-party images (SA-5).
4. Keep any future tokens only in GitHub Actions or Cloudflare secrets, never in files.
