# the desk

Shravan's private dashboard for the photography page: add photos from your phone or computer,
group them into rolls, write captions, then **save** (to a preview) and **publish** (live).

It's its own small website on Cloudflare Pages, made from this folder. Cloudflare Access puts a
login wall in front of all of it: you type your email, get a 6-digit code, and you're in. Nobody
else can open it, even with the link. GitHub Pages never publishes this folder (it skips folders
whose names start with `_`), and no public page links to it.

## How it works

```
your phone ── photo.js makes the webp files, reads year/camera/settings/place, drops GPS
     │
     ▼
desk page (index.html, desk.js) ──► /api/… (functions/api/[[path]].js on Cloudflare)
                                        │  1. checks Cloudflare Access signed this request, for your email
                                        │  2. uses the GitHub key only Cloudflare knows
                                        ▼
                         GitHub: data/photos.json + images/photos/ on the `drafts` branch
                                        │  "publish" merges drafts into main
                                        ▼
                         main ──► GitHub Pages ──► shravanlad.com/photography/
```

- **Save** makes one commit on `drafts`. Its preview link shows exactly what will go live.
- **Publish** merges `drafts` into `main`. The live site updates in a minute or two.
- Photos: up to 2560px on the long side (full view) and 700px wide (strips), webp at high quality.
  Keep your originals in your own backup. The site only keeps the web copies.
- **The repo is public.** "Hidden" keeps a roll or photo off the page, but the files and captions
  are still readable on GitHub. Don't upload anything you'd mind someone finding there.

## What it costs
Nothing, on these free plans:
- **Cloudflare Pages**: free (500 builds a month, unlimited visits). The server code runs on Workers' free tier, 100,000 requests a day; the desk uses a few hundred on a busy day.
- **Cloudflare Zero Trust** (the login wall): free for up to 50 people. Signing up may ask for a card even on the free plan; the free plan isn't charged.
- **GitHub**: the key and the repo are free. Photos add about 1 MB each to the repo; GitHub Pages allows a 1 GB site, so roughly 800 photos before that matters.
- **OpenStreetMap** place lookups: free, with fair use (one a second, which the desk keeps to).

## One-time setup (about 20 minutes)

### 1. A GitHub key that can only touch this repo
1. github.com → your picture → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. Name `desk`. Expiration: 1 year (put a reminder in your calendar to renew it).
3. Repository access: **Only select repositories** → `personal-website`.
4. Permissions → Repository permissions → **Contents: Read and write**. Nothing else.
5. Generate, and copy it. You'll paste it into Cloudflare in step 3 and nowhere else.

### 2. The desk's Cloudflare Pages site
1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → `personal-website`.
2. Project name: something not guessable, e.g. `desk-` plus a few random letters. It becomes `https://<name>.pages.dev`.
3. Production branch `main`. Framework preset: None. Build command: empty. Build output directory: `/`.
   **Root directory: `_desk`.**
4. Save and deploy. Then Settings → Builds → **Branch control**: turn preview deployments **off**
   (only `main` builds the desk).

### 3. The login wall (Cloudflare Access)
1. Cloudflare dashboard → **Zero Trust** (the free plan is enough; pick a team name if asked).
2. **Access** → **Applications** → **Add an application** → **Self-hosted**.
3. Name `desk`. Domain: your `<name>.pages.dev`. Session duration: 1 month.
4. Policy: name `only me`, action **Allow**, Include → **Emails** → your email.
5. Login method: **One-time PIN** (it's on by default).
6. Save. Open the application again and copy its **Application Audience (AUD) Tag** → `ACCESS_AUD`.
7. Your team domain is under Zero Trust → **Settings** → **Custom pages** → `ACCESS_TEAM_DOMAIN`.

### 4. The drafts preview
In the **staging** Pages project (the one for staging.shravanlad.com) → Settings → Builds → **Branch
control** → make sure preview deployments include the `drafts` branch. Its address is
`https://drafts.<staging-project>.pages.dev` → `PREVIEW_URL`.

### 5. Its settings (now you have every value)
Project → **Settings** → **Variables and secrets** → add (Production):

| name | value |
|---|---|
| `GITHUB_TOKEN` | the key from step 1. Choose **Secret** (encrypted, never shown again) |
| `REPO` | `shhravan/personal-website` |
| `OWNER_EMAIL` | the email you'll log in with |
| `ACCESS_TEAM_DOMAIN` | from step 3, e.g. `shravan.cloudflareaccess.com` |
| `ACCESS_AUD` | from step 3 |
| `PREVIEW_URL` | from step 4, e.g. `https://drafts.<staging-project>.pages.dev` |

Then Deployments → the latest → **Retry deployment**, so it picks them up.

### 6. Try it
Open `https://<name>.pages.dev` in a private window. You should see Cloudflare's login page, then
the desk with the current rolls. In another browser, try an email that isn't yours: no code arrives.

## If something goes wrong
- "you're not signed in, or this desk isn't set up yet": one of the settings in step 3 is missing,
  or `OWNER_EMAIL` doesn't match the email you logged in with. The server refuses everything
  until all of them are there.
- "drafts changed somewhere else": the desk is open in two places. Reload, then redo the last edit.
- A publish went wrong: on GitHub, find the "desk: publish" commit on `main` and revert it
  (see docs/SECURITY_RUNBOOK.md).
- Lost phone or leaked key: revoke the GitHub token (step 1 page) and make a new one, and in
  Zero Trust → **My Team** → **Users**, revoke your sessions.

## Files
- `index.html`, `desk.css`, `desk.js`: the page.
- `photo.js`: resizing, webp encoding and reading metadata, all on your device.
- `functions/api/[[path]].js`: the server side (login check, GitHub). Tested by `tests/desk_api_test.mjs`.
- `vendor/`: copied libraries. exifr 7.1.3 (MIT) reads metadata. jSquash webp 1.5.0 (Apache-2.0,
  Google's libwebp) encodes webp, with its one dependency check inlined into `encode.js`.
- `_headers`: security headers for the desk site.
