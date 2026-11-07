# Security checklist

| Area | Status | Evidence / follow-up |
|---|---|---|
| A. Secrets in files and git history | PASS | Pattern scan of tracked files and full history: 0 hits |
| A. .gitignore / env files | NOT APPLICABLE | No env files or secrets used |
| B. Authentication | PASS | Visitors: none. The desk: Cloudflare Access (email code); the server re-verifies the signed token (RS256 signature, audience, issuer, expiry, owner email) on every request and fails closed. Tested in `tests/desk_api_test.mjs` |
| C. Authorization | PASS | One user (the owner). The GitHub token is fine-grained: this repo, Contents only, stored only as a Cloudflare secret |
| D. Database / storage | NOT APPLICABLE | None |
| E. XSS / injection | PASS | No user input; innerHTML only with constants; CSP blocks injected inline script (tested) |
| E. Open redirect / SSRF | PASS | Relay fetches only allowlisted Substack hosts and paths, https only, keyed |
| F. HTTPS + HSTS | PASS | 301 to HTTPS; HSTS header present on live site |
| F. Content Security Policy | PASS | Meta CSP on all pages; negative test blocked script and image |
| F. Referrer-Policy | PASS | Meta tag on all pages |
| F. Clickjacking protection | FAIL (accepted) | GitHub Pages cannot send frame-ancestors / X-Frame-Options; no sensitive actions to hijack |
| F. CORS / cookies / CSRF | PASS | Public site: none. Desk writes require same Origin plus an `X-Desk` header a form can't send |
| G. File uploads | PASS | Desk only: webp files checked by signature, 10 MB cap, written only to `images/photos/NAME(-700).webp` with names matching `[a-z0-9-]`; photos.json rebuilt from known fields with length caps |
| H. Dependencies | PASS | No packages; third parties limited by CSP; workflows use only pinned official actions |
| I. CI/CD | PASS | Tests on every push; sync workflow has minimal permissions and runs tests before publishing |
| I. Branch protection on main | NOT VERIFIED | Owner to enable in repo settings |
| I. Account MFA | NOT VERIFIED | Owner to confirm on GitHub |
| J. Payments / business logic | NOT APPLICABLE | None |
| K. Rate limiting / abuse | PASS | Static hosting; relay rejects requests without the key |
| L. Privacy | PASS | No analytics or tracking; only localStorage theme choice. Desk uploads are re-encoded on the device, so GPS and other metadata never reach the repo; only a town name is kept (looked up at ~100 m precision). The repo is public: hidden photos are still readable there |
| M. Logging / monitoring | NOT APPLICABLE | No server; GitHub keeps deploy history |
| N. Automated security tests | PASS | `tests/` runs on every push (site, sync pipeline, relay) |
| O. AI / LLM at runtime | NOT APPLICABLE | None |
| P. Third-party script privileges | PASS | None: `script-src 'self'`, songs are self-hosted |
