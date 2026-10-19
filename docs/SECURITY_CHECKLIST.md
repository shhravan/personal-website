# Security checklist

| Area | Status | Evidence / follow-up |
|---|---|---|
| A. Secrets in files and git history | PASS | Pattern scan of tracked files and full history: 0 hits |
| A. .gitignore / env files | NOT APPLICABLE | No env files or secrets used |
| B. Authentication | NOT APPLICABLE | No accounts or login |
| C. Authorization | NOT APPLICABLE | No protected resources |
| D. Database / storage | NOT APPLICABLE | None |
| E. XSS / injection | PASS | No user input; innerHTML only with constants; CSP blocks injected inline script (tested) |
| E. Open redirect / SSRF | NOT APPLICABLE | No redirects or server fetches |
| F. HTTPS + HSTS | PASS | 301 to HTTPS; HSTS header present on live site |
| F. Content Security Policy | PASS | Meta CSP on all pages; negative test blocked script and image |
| F. Referrer-Policy | PASS | Meta tag on all pages |
| F. Clickjacking protection | FAIL (accepted) | GitHub Pages cannot send frame-ancestors / X-Frame-Options; no sensitive actions to hijack |
| F. CORS / cookies / CSRF | NOT APPLICABLE | No API, cookies or state-changing requests |
| G. File uploads | NOT APPLICABLE | None |
| H. Dependencies | PASS | No packages; third parties limited to Google Fonts and YouTube by CSP |
| I. CI/CD | NOT APPLICABLE | No workflows (Pages deploys from main) |
| I. Branch protection on main | NOT VERIFIED | Owner to enable in repo settings |
| I. Account MFA | NOT VERIFIED | Owner to confirm on GitHub |
| J. Payments / business logic | NOT APPLICABLE | None |
| K. Rate limiting / abuse | NOT APPLICABLE | Static hosting; no endpoints |
| L. Privacy | PASS | No analytics or tracking; only localStorage theme choice; YouTube loads only after a click |
| M. Logging / monitoring | NOT APPLICABLE | No server; GitHub keeps deploy history |
| N. Automated security tests | NEEDS REVIEW | Manual browser checks this audit; no CI. Optional: add a workflow later |
| O. AI / LLM at runtime | NOT APPLICABLE | None. Development uses an AI agent via PRs reviewed and merged in GitHub |
| P. Third-party script privileges | PASS | Only YouTube's player script, loaded on demand, restricted by CSP |
