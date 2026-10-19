# Security remediation log

## October 2026
**Changed:** `index.html`, `about/`, `work/`, `blog/`, `photography/`, `rabbit-hole/` `index.html`: added a Content Security Policy meta tag and a Referrer-Policy meta tag. Added the four SECURITY_*.md documents.

**Why:** defence in depth against script injection (SA-1) and less URL leakage on outbound clicks (SA-2).

**Tests run (local headless Chromium, synthetic interactions):**
- Home, about, work load with 0 console errors and 0 CSP violations — PASS
- Letter field, photo click, light switch, fonts, YouTube player iframe — PASS
- Injected inline script blocked; off-list image blocked — PASS
- Secret scan of files and history — PASS (0 hits)

**Not run:** tests against GitHub account/repo settings (no access); real-device checks.

**Pending owner decisions:** MFA, branch protection, third-party images (see docs/SECURITY_AUDIT.md).
