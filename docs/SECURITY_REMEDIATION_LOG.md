# Security remediation log

## October 2026
**Changed:** every page: added a Content Security Policy meta tag and a Referrer-Policy meta tag. Added the four SECURITY_*.md documents.

**Why:** defence in depth against script injection (SA-1) and less URL leakage on outbound clicks (SA-2).

**Tests run (local headless Chromium, synthetic interactions):**
- Home and section pages load with 0 console errors and 0 CSP violations — PASS
- Letter field, photo click, light switch, fonts, YouTube player iframe — PASS
- Injected inline script blocked; off-list image blocked — PASS
- Secret scan of files and history — PASS (0 hits)

**Not run:** tests against GitHub account/repo settings (no access); real-device checks.

**Pending owner decisions:** MFA, branch protection, third-party images (see docs/SECURITY_AUDIT.md).

## 2026-10 · Substack blog pipeline hardening (found by tests/)
| Finding | Risk | Fix |
|---|---|---|
| Post slug used directly as a folder name | Path traversal: a slug like `../../index` could overwrite site files | Slugs must match `^[a-z0-9][a-z0-9-]{0,150}$`, duplicates dropped |
| `<source>` (inside Substack's `<picture>`) treated as a container | Rest of the post silently disappeared after the first image | Void tags handled separately from dropped containers |
| Unclosed tags in a post | Broken markup could swallow the page's own footer | Cleaner closes whatever the post left open |
| Images trusted by URL extension | An "image" that is really HTML/SVG served from our domain | Only https, ≤10 MB, real JPEG/PNG/GIF/WebP by magic bytes |
| Canonical/"also on substack" URL trusted | `javascript:` link on every post | Must be `https://`; otherwise rebuilt from the slug |
| Empty or partial API response | Every blog post deleted on the next run | Refuses to remove more than half the posts without `--allow-delete` |
| RSS fallback parsed any XML | Entity-expansion ("billion laughs") XML bomb | Feeds with a DTD/ENTITY are refused |
| Non-https or unbounded downloads | SSRF to file:/http:, memory exhaustion | `get()` allows https only and caps response size; pagination capped |
| One bad post or image | Whole sync aborted | Failures are per post / per image and logged |
Site-wide checks added in `tests/test_site.py`: strict CSP on every page (no unsafe-inline/eval, object-src none, form-action none, base-uri self), no inline scripts/handlers/styles, noopener on new-tab links, no whole email address in source, no eval/document.write, no URL data written as HTML, page swaps same-origin only, theme value whitelisted, YouTube IDs well-formed, no secrets or key files in the repo, workflows with explicit minimal permissions and only official pinned actions.

