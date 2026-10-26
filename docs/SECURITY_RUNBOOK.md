# Security runbook

## Safe local checks
- Secret scan: `git grep -nIiE 'api[_-]?key|secret|token|BEGIN .*PRIVATE KEY'` and `git log -p | grep -iE 'ghp_|AKIA|sk-'`.
- Open the site with the browser console open: there should be no red errors and no "Content Security Policy" messages.
- If a new outside service is added (e.g. a font or embed), add its domain to the CSP meta tag on every page, or it will be blocked.

## If a credential is ever exposed (e.g. the relay key)
1. Revoke or rotate it at the provider immediately.
2. Generate a new one and store it only in GitHub → Settings → Secrets and variables → Actions.
3. Remove it from files; note it remains in git history, so revocation is what makes it safe.

## Incident response / rollback
- Something broken or defaced: on GitHub, open the last good merged PR and click **Revert**, then merge the revert PR. Pages redeploys in ~1 minute.
- Suspicious repo activity: change the GitHub password, revoke sessions and tokens (Settings → Sessions / Developer settings), check Settings → Collaborators.
- Take the site offline fast: Settings → Pages → set Source to "None".

## Backups
The git repository is the backup: every version is in its history and on GitHub. Keep a local or second clone if you want an off-GitHub copy.

## Deploy checks
After each merge: the Actions tab shows "pages build and deployment" succeeded; load the site and hard-refresh; check the console.

## Substack sync Action
- `.github/workflows/substack.yml` has `contents: write` so it can commit blog pages. It runs only our own script, pins official actions (`actions/checkout@v4`, `actions/setup-python@v5`). Its only secret is the relay key (`SUBSTACK_RELAY_KEY`). It also has `actions: write`, used only to re-enable its own schedule (GitHub disables idle scheduled workflows after 60 days).
- Post HTML is cleaned to an allowlist before it reaches the site, and images are served from our own domain, so the Content-Security-Policy didn't need to change.
- Relay: `worker/feed-relay.js` on Cloudflare. Allowlisted hosts/paths only, https only, constant-time key check, GET only, 20 MB cap, refuses everything if `RELAY_KEY` is unset. To rotate the key: generate a new random value, update the Worker secret `RELAY_KEY` and the GitHub secret `SUBSTACK_RELAY_KEY`, run the sync once.

