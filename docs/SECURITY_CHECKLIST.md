# Security checklist

| Area | Status | Evidence / follow-up |
|---|---|---|
| A. Secrets in files and git history | PASS | Pattern scan of tracked files and full history: 0 hits |
| A. .gitignore / env files | NOT APPLICABLE | No env files or secrets used |
| B. Authentication | NOT APPLICABLE | No accounts or login |
| C. Authorization | NOT APPLICABLE | No protected resources |
| D. Database / storage | NOT APPLICABLE | None |
| E. XSS / injection | PASS | No user input; innerHTML only with constants; CSP blocks injected inline script (tested) |
| E. Open redirect / SSRF | PASS | Relay fetches only allowlisted Substack hosts and paths, https only, keyed |
| F. HTTPS + HSTS | PASS | 301 to HTTPS; HSTS header present on live site |
| F. Content Security Policy | PASS | Meta CSP on all pages; negative test blocked script and image |
| F. Referrer-Policy | PASS | Meta tag on all pages |
| F. Clickjacking protection | FAIL (accepted) | GitHub Pages cannot send frame-ancestors / X-Frame-Options; no sensitive actions to hijack |
| F. CORS / cookies / CSRF | NOT APPLICABLE | No API, cookies or state-changing requests |
| G. File uploads | NOT APPLICABLE | None |
| H. Dependencies | PASS | No packages; third parties limited by CSP; workflows use only pinned official actions |
| I. CI/CD | PASS | Tests on every push; sync workflow has minimal permissions and runs tests before publishing |
| I. Branch protection on main | NOT VERIFIED | Owner to enable in repo settings |
| I. Account MFA | NOT VERIFIED | Owner to confirm on GitHub |
| J. Payments / business logic | NOT APPLICABLE | None |
| K. Rate limiting / abuse | PASS | Static hosting; relay rejects requests without the key |
| L. Privacy | PASS | No analytics or tracking; only localStorage theme choice |
| M. Logging / monitoring | NOT APPLICABLE | No server; GitHub keeps deploy history |
| N. Automated security tests | PASS | `tests/` runs on every push (site, sync pipeline, relay) |
| O. AI / LLM at runtime | NOT APPLICABLE | None |
| P. Third-party script privileges | PASS | Only YouTube's player script, loaded on demand, restricted by CSP |
