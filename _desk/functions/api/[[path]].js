// The desk's server side: a Cloudflare Pages Function answering every address under /api/.
//
// The desk page (../../index.html) never talks to GitHub itself. It asks this code, which:
//   1. checks the visitor is Shravan (Cloudflare Access signs every request after the email-code
//      login; we verify that signature and the email on it, and refuse everything else), then
//   2. reads and writes the repo with a GitHub key that only Cloudflare knows (GITHUB_TOKEN).
//
// Saves go to the `drafts` branch (shown on its own preview link); "publish" merges drafts into
// `main`, which is the live site. Settings, all in Cloudflare (Pages → desk → Settings → Variables):
//   GITHUB_TOKEN        secret. Fine-grained GitHub token: this repo only, Contents read and write.
//   REPO                shhravan/personal-website
//   ACCESS_TEAM_DOMAIN  e.g. shravan.cloudflareaccess.com (Zero Trust → Settings → Custom pages)
//   ACCESS_AUD          the Access application's "Application Audience (AUD) Tag"
//   OWNER_EMAIL         the one email allowed in
//   PREVIEW_URL         optional: the drafts preview link, shown as a button
// If any of the first five is missing, every request is refused (it fails closed).

const DRAFTS = "drafts", LIVE = "main";
const NAME = /^[a-z0-9][a-z0-9-]{0,59}$/;          // photo file names: lowercase, digits, dashes
const ROLL_ID = /^[a-z0-9][a-z0-9-]{0,39}$/;
const DIRS = ["images/hero", "images/photos"];      // hero: the original photos; photos: added here
const MAX_IMAGE = 10 * 1024 * 1024;

// ---------- who is asking ----------

let certs = null, certsAt = 0;
function b64urlBytes(s) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "="));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}
const b64urlJson = (s) => JSON.parse(new TextDecoder().decode(b64urlBytes(s)));

// Returns the signed-in email, or null. Checks the token's signature against Cloudflare's published
// keys, that it was made for this application (aud), by our team (iss), hasn't expired, and the email.
export async function whoIs(request, env, now = Date.now() / 1000) {
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD || !env.OWNER_EMAIL || !env.GITHUB_TOKEN || !env.REPO) return null;
  try {
    const [h, p, s] = token.split(".");
    const header = b64urlJson(h), claims = b64urlJson(p);
    if (header.alg !== "RS256") return null;
    const team = "https://" + env.ACCESS_TEAM_DOMAIN;
    if (!certs || now - certsAt > 3600) {
      certs = (await (await fetch(team + "/cdn-cgi/access/certs")).json()).keys;
      certsAt = now;
    }
    const jwk = certs.find((k) => k.kid === header.kid);
    if (!jwk) { certs = null; return null; }
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64urlBytes(s), new TextEncoder().encode(h + "." + p));
    const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!ok || !aud.includes(env.ACCESS_AUD) || claims.iss !== team) return null;
    if (typeof claims.exp !== "number" || claims.exp < now) return null;
    const email = String(claims.email || "").toLowerCase();
    return email && email === env.OWNER_EMAIL.toLowerCase() ? email : null;
  } catch {
    return null;
  }
}

// ---------- GitHub ----------

async function gh(env, method, path, body, accept) {
  const r = await fetch("https://api.github.com/repos/" + env.REPO + path, {
    method,
    headers: {
      Authorization: "Bearer " + env.GITHUB_TOKEN,
      Accept: accept || "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "shravanlad-desk",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (accept && r.ok) return r;
  const data = r.status === 204 ? null : await r.json().catch(() => null);
  if (!r.ok) {
    const e = new Error((data && data.message) || "GitHub said " + r.status);
    e.status = r.status;
    throw e;
  }
  return data;
}

const refSha = async (env, branch) => (await gh(env, "GET", "/git/ref/heads/" + branch)).object.sha;

// Makes sure drafts exists and has everything main has (code changes land on main through pull
// requests; drafts picks them up here so its preview shows the current site).
async function freshDrafts(env) {
  let sha;
  try {
    sha = await refSha(env, DRAFTS);
  } catch (e) {
    if (e.status !== 404) throw e;
    sha = await refSha(env, LIVE);
    await gh(env, "POST", "/git/refs", { ref: "refs/heads/" + DRAFTS, sha });
    return sha;
  }
  const cmp = await gh(env, "GET", "/compare/" + LIVE + "..." + DRAFTS);
  if (cmp.behind_by > 0) {
    const m = await gh(env, "POST", "/merges", { base: DRAFTS, head: LIVE, commit_message: "desk: bring drafts up to date with the live site" });
    if (m) sha = m.sha;
  }
  return sha;
}

async function readPhotos(env, ref) {
  const r = await gh(env, "GET", "/contents/data/photos.json?ref=" + ref, null, "application/vnd.github.raw+json");
  return r.json();
}

// ---------- checking what the desk sends ----------

const text = (v, max) => (typeof v === "string" ? v.slice(0, max).replace(/[\u0000-\u001f\u007f]/g, " ").trim() : "");

// Rebuilds photos.json from only the fields we know, with lengths capped. Anything else is dropped,
// and a malformed file is refused rather than saved.
export function cleanPhotos(input) {
  if (!input || typeof input !== "object") throw new Error("photos: not an object");
  const names = new Set(), ids = new Set();
  const rolls = (list, kind) => {
    if (!Array.isArray(list) || list.length > 60) throw new Error(kind + ": expected a list of up to 60 rolls");
    return list.map((r) => {
      if (!r || !ROLL_ID.test(r.id) || ids.has(r.id)) throw new Error("roll: bad or repeated id");
      ids.add(r.id);
      if (!Array.isArray(r.photos) || r.photos.length > 80) throw new Error("roll " + r.id + ": up to 80 photos");
      const out = { id: r.id, name: text(r.name, 80) || "untitled", hidden: r.hidden === true };
      if (kind === "commercial") { out.client = text(r.client, 60); out.year = text(r.year, 12); }
      out.photos = r.photos.map((p) => {
        if (!p || !NAME.test(p.name) || names.has(p.name)) throw new Error("photo: bad or repeated name");
        if (!DIRS.includes(p.dir)) throw new Error("photo " + p.name + ": unknown folder");
        names.add(p.name);
        const f = Array.isArray(p.focus) ? p.focus.map(Number) : [50, 50, 1];
        const focus = f.length === 3 && f.every(Number.isFinite)
          ? [Math.min(100, Math.max(0, Math.round(f[0]))), Math.min(100, Math.max(0, Math.round(f[1]))), Math.min(2, Math.max(1, Math.round(f[2] * 100) / 100))]
          : [50, 50, 1];
        return {
          name: p.name, dir: p.dir,
          caption: text(p.caption, 120), alt: text(p.alt, 300), place: text(p.place, 80), year: text(p.year, 12),
          film: text(p.film, 60), camera: text(p.camera, 60), settings: text(p.settings, 60),
          focus, hidden: p.hidden === true,
        };
      });
      return out;
    });
  };
  return { version: 1, gallery: rolls(input.gallery, "gallery"), commercial: rolls(input.commercial, "commercial") };
}

// A webp file starts with "RIFF", four bytes of length, then "WEBP".
export function isWebp(bytes) {
  const s = (a, b) => String.fromCharCode(...bytes.slice(a, b));
  return bytes.length > 12 && s(0, 4) === "RIFF" && s(8, 12) === "WEBP";
}

function base64(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

// ---------- the routes ----------

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
});

async function route(request, env, path) {
  const method = request.method;

  // Everything the desk needs to start: the photos on drafts, and how many saves aren't live yet.
  if (method === "GET" && path === "state") {
    const base = await freshDrafts(env);
    const cmp = await gh(env, "GET", "/compare/" + LIVE + "..." + DRAFTS);
    return json({ base, unpublished: cmp.ahead_by, photos: await readPhotos(env, base), preview: env.PREVIEW_URL || null });
  }

  // A photo file from drafts, so the desk can show thumbnails of photos that aren't live yet.
  if (method === "GET" && path === "file") {
    const p = new URL(request.url).searchParams.get("path") || "";
    const m = p.match(/^(images\/(?:hero|photos))\/([a-z0-9-]+?)(-700)?\.webp$/);
    if (!m) return json({ error: "bad path" }, 400);
    const r = await gh(env, "GET", "/contents/" + p + "?ref=" + DRAFTS, null, "application/vnd.github.raw+json");
    return new Response(r.body, { headers: { "Content-Type": "image/webp", "Cache-Control": "private, max-age=86400" } });
  }

  // One photo file, uploaded on its own (photos are big, so not inside the save). Stored by GitHub
  // as a "blob" that the next save then puts in place.
  if (method === "POST" && path === "blob") {
    const bytes = new Uint8Array(await request.arrayBuffer());
    if (bytes.length > MAX_IMAGE || !isWebp(bytes)) return json({ error: "only webp photos up to 10 MB" }, 400);
    const b = await gh(env, "POST", "/git/blobs", { content: base64(bytes), encoding: "base64" });
    return json({ sha: b.sha });
  }

  // Save: one commit on drafts with the new photos.json, the new photo files, and the removal of
  // any desk photo (images/photos/) no roll uses any more. `base` is the drafts commit the desk
  // started from; if drafts moved since (another tab, another device), we refuse rather than
  // overwrite, and the desk reloads.
  if (method === "POST" && path === "save") {
    const body = await request.json();
    const photos = cleanPhotos(body.photos);
    const base = await refSha(env, DRAFTS);
    if (body.base !== base) return json({ error: "drafts changed somewhere else. reload to get the latest." }, 409);
    const used = new Set([...photos.gallery, ...photos.commercial].flatMap((r) => r.photos).filter((p) => p.dir === "images/photos").map((p) => p.name));
    const tree = [];
    for (const u of Array.isArray(body.uploads) ? body.uploads : []) {
      if (!NAME.test(u.name) || !used.has(u.name)) throw new Error("upload " + u.name + ": not in any roll");
      for (const [suffix, sha] of [["", u.large], ["-700", u.small]]) {
        if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error("upload " + u.name + ": missing file");
        tree.push({ path: "images/photos/" + u.name + suffix + ".webp", mode: "100644", type: "blob", sha });
      }
    }
    let existing = [];
    try { existing = await gh(env, "GET", "/contents/images/photos?ref=" + base); } catch (e) { if (e.status !== 404) throw e; }
    for (const f of existing) {
      const m = f.name.match(/^([a-z0-9-]+?)(-700)?\.webp$/);
      if (m && !used.has(m[1])) tree.push({ path: "images/photos/" + f.name, mode: "100644", type: "blob", sha: null });
    }
    const file = await gh(env, "POST", "/git/blobs", { content: JSON.stringify(photos, null, 2) + "\n", encoding: "utf-8" });
    tree.push({ path: "data/photos.json", mode: "100644", type: "blob", sha: file.sha });
    const commit = await gh(env, "GET", "/git/commits/" + base);
    const t = await gh(env, "POST", "/git/trees", { base_tree: commit.tree.sha, tree });
    const c = await gh(env, "POST", "/git/commits", { message: text(body.message, 200) || "desk: update photos", tree: t.sha, parents: [base] });
    await gh(env, "PATCH", "/git/refs/heads/" + DRAFTS, { sha: c.sha, force: false });
    const cmp = await gh(env, "GET", "/compare/" + LIVE + "..." + DRAFTS);
    return json({ base: c.sha, unpublished: cmp.ahead_by });
  }

  // Publish: merge drafts into main (the live site rebuilds in a minute or two), then move drafts
  // up to that same commit so the two start level again.
  if (method === "POST" && path === "publish") {
    const body = await request.json();
    const base = await refSha(env, DRAFTS);
    if (body.base !== base) return json({ error: "drafts changed somewhere else. reload first." }, 409);
    const m = await gh(env, "POST", "/merges", { base: LIVE, head: DRAFTS, commit_message: "desk: publish" });
    const live = m ? m.sha : await refSha(env, LIVE);
    await gh(env, "PATCH", "/git/refs/heads/" + DRAFTS, { sha: live, force: false });
    return json({ base: live, unpublished: 0 });
  }

  return json({ error: "not found" }, 404);
}

export async function onRequest(context) {
  const { request, env, params } = context;
  if (!(await whoIs(request, env))) return json({ error: "not signed in" }, 403);
  // Writes must come from the desk page itself: same site, plus a header a plain form can't send.
  if (request.method !== "GET") {
    const origin = request.headers.get("Origin");
    if (origin !== new URL(request.url).origin || request.headers.get("X-Desk") !== "1") return json({ error: "refused" }, 403);
  }
  const path = [].concat(params.path || []).join("/");
  try {
    return await route(request, env, path);
  } catch (e) {
    return json({ error: e.message || "something went wrong" }, e.status === 409 ? 409 : 500);
  }
}
