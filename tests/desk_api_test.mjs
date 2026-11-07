// Tests for the desk's server code (_desk/functions/api/[[path]].js), run by tests/test_desk.py.
// GitHub and Cloudflare Access are faked here, so nothing leaves this machine.
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const api = await import(pathToFileURL(path.join(here, "..", "_desk", "functions", "api", "[[path]].js")).href);
const { whoIs, cleanPhotos, isWebp, onRequest } = api;

const results = [];
async function test(name, fn) {
  try { await fn(); results.push("ok   " + name); }
  catch (e) { results.push("FAIL " + name + ": " + e.message); process.exitCode = 1; }
}

// ---------- a fake Cloudflare Access ----------
const TEAM = "shravan.cloudflareaccess.com", AUD = "aud-123", OWNER = "owner@example.com";
const pair = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const otherPair = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const jwk = { ...(await crypto.subtle.exportKey("jwk", pair.publicKey)), kid: "k1" };
const b64url = (buf) => Buffer.from(buf).toString("base64url");
async function token(claims, { key = pair.privateKey, alg = "RS256" } = {}) {
  const h = b64url(JSON.stringify({ alg, kid: "k1" })), p = b64url(JSON.stringify(claims));
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(h + "." + p));
  return h + "." + p + "." + b64url(sig);
}
const now = Math.floor(Date.now() / 1000);
const good = { aud: [AUD], iss: "https://" + TEAM, exp: now + 600, email: "Owner@Example.com" };
const env = { ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, OWNER_EMAIL: OWNER, GITHUB_TOKEN: "x", REPO: "o/r" };
const req = (t, init = {}) => new Request("https://desk.example/api/state", { ...init, headers: { "Cf-Access-Jwt-Assertion": t, ...(init.headers || {}) } });

// ---------- a fake GitHub ----------
let gh;   // the state the fake GitHub holds
function resetGh() {
  gh = {
    refs: { main: "m1", drafts: "d1" },
    photosJson: { version: 1, gallery: [], commercial: [] },
    photosDir: [{ name: "old-one.webp" }, { name: "old-one-700.webp" }, { name: "keep.webp" }, { name: "keep-700.webp" }],
    trees: [], commits: [], merges: [], blobs: 0,
  };
}
globalThis.fetch = async (url, init = {}) => {
  url = String(url);
  const method = init.method || "GET";
  const body = init.body ? JSON.parse(init.body) : null;
  const ok = (data, status = 200) => new Response(data === null ? null : JSON.stringify(data), { status });
  if (url === "https://" + TEAM + "/cdn-cgi/access/certs") return ok({ keys: [jwk] });
  const m = url.match(/^https:\/\/api\.github\.com\/repos\/o\/r(\/.*)$/);
  if (!m) throw new Error("unexpected fetch " + url);
  const p = m[1];
  if (method === "GET" && p.startsWith("/git/ref/heads/")) return ok({ object: { sha: gh.refs[p.split("/").pop()] } });
  if (method === "GET" && p.startsWith("/compare/")) return ok({ ahead_by: 1, behind_by: 0 });
  if (method === "GET" && p.startsWith("/contents/data/photos.json")) return new Response(JSON.stringify(gh.photosJson));
  if (method === "GET" && p.startsWith("/contents/images/photos")) return ok(gh.photosDir);
  if (method === "POST" && p === "/git/blobs") { gh.blobs++; return ok({ sha: "b".repeat(39) + gh.blobs }, 201); }
  if (method === "GET" && p.startsWith("/git/commits/")) return ok({ tree: { sha: "t0" } });
  if (method === "POST" && p === "/git/trees") { gh.trees.push(body); return ok({ sha: "t1" }, 201); }
  if (method === "POST" && p === "/git/commits") { gh.commits.push(body); return ok({ sha: "c1" }, 201); }
  if (method === "PATCH" && p.startsWith("/git/refs/heads/")) { gh.refs[p.split("/").pop()] = body.sha; return ok({}); }
  if (method === "POST" && p === "/merges") { gh.merges.push(body); return ok({ sha: "merge1" }, 201); }
  throw new Error("unexpected GitHub call " + method + " " + p);
};

// ---------- who is asking ----------
await test("the owner's signed token is accepted (email in any case)", async () => {
  assert.equal(await whoIs(req(await token(good)), env), OWNER);
});
await test("someone else's email is refused", async () => {
  assert.equal(await whoIs(req(await token({ ...good, email: "friend@example.com" })), env), null);
});
await test("a token for another application is refused", async () => {
  assert.equal(await whoIs(req(await token({ ...good, aud: ["other"] })), env), null);
});
await test("a token from another team is refused", async () => {
  assert.equal(await whoIs(req(await token({ ...good, iss: "https://evil.cloudflareaccess.com" })), env), null);
});
await test("an expired token is refused", async () => {
  assert.equal(await whoIs(req(await token({ ...good, exp: now - 1 })), env), null);
});
await test("a token signed with the wrong key is refused", async () => {
  assert.equal(await whoIs(req(await token(good, { key: otherPair.privateKey })), env), null);
});
await test("an unsigned token (alg none) is refused", async () => {
  const t = (await token(good)).split(".");
  const h = b64url(JSON.stringify({ alg: "none", kid: "k1" }));
  assert.equal(await whoIs(req(h + "." + t[1] + "."), env), null);
});
await test("no token at all is refused", async () => {
  assert.equal(await whoIs(new Request("https://desk.example/api/state"), env), null);
});
await test("if the desk isn't set up (no settings), everything is refused", async () => {
  assert.equal(await whoIs(req(await token(good)), { ...env, OWNER_EMAIL: "" }), null);
  assert.equal(await whoIs(req(await token(good)), { ...env, GITHUB_TOKEN: undefined }), null);
});

// ---------- what can be saved ----------
const photo = (name, extra = {}) => ({ name, dir: "images/photos", caption: "c", focus: [50, 50, 1], ...extra });
await test("unknown fields are dropped and long text is cut", () => {
  const out = cleanPhotos({ gallery: [{ id: "g1", name: "x".repeat(200), evil: "<script>", photos: [photo("a", { caption: "y".repeat(500), onload: "x" })] }], commercial: [] });
  assert.equal(out.gallery[0].name.length, 80);
  assert.equal(out.gallery[0].photos[0].caption.length, 120);
  assert.equal(out.gallery[0].evil, undefined);
  assert.equal(out.gallery[0].photos[0].onload, undefined);
});
await test("photo names that could escape the folder are refused", () => {
  for (const name of ["../x", "a/b", "A", "x.webp", "", "-x"]) {
    assert.throws(() => cleanPhotos({ gallery: [{ id: "g1", photos: [photo(name)] }], commercial: [] }), undefined, name);
  }
});
await test("folders other than the two photo folders are refused", () => {
  assert.throws(() => cleanPhotos({ gallery: [{ id: "g1", photos: [photo("a", { dir: "data" })] }], commercial: [] }));
});
await test("the same photo name twice is refused", () => {
  assert.throws(() => cleanPhotos({ gallery: [{ id: "g1", photos: [photo("a")] }], commercial: [{ id: "c1", photos: [photo("a")] }] }));
});
await test("focus numbers are kept in range", () => {
  const out = cleanPhotos({ gallery: [{ id: "g1", photos: [photo("a", { focus: [150, -3, 9] })] }], commercial: [] });
  assert.deepEqual(out.gallery[0].photos[0].focus, [100, 0, 2]);
});
await test("only real webp files count as webp", () => {
  assert.ok(isWebp(new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 ...")));
  assert.ok(!isWebp(new TextEncoder().encode("<html><script>alert(1)</script>")));
});

// ---------- the routes ----------
const call = async (p, init = {}) => {
  const t = await token(good);
  const r = new Request("https://desk.example/api/" + p, { ...init, headers: { "Cf-Access-Jwt-Assertion": t, Origin: "https://desk.example", "X-Desk": "1", "Content-Type": "application/json", ...(init.headers || {}) } });
  const res = await onRequest({ request: r, env, params: { path: p.split("?")[0].split("/") } });
  return [res.status, await res.json().catch(() => null)];
};
await test("a write from another site is refused, even when signed in", async () => {
  resetGh();
  const t = await token(good);
  const r = new Request("https://desk.example/api/publish", { method: "POST", body: "{}", headers: { "Cf-Access-Jwt-Assertion": t, Origin: "https://evil.example", "X-Desk": "1" } });
  assert.equal((await onRequest({ request: r, env, params: { path: ["publish"] } })).status, 403);
});
await test("save makes one commit on drafts, adds new photos and removes unused desk photos", async () => {
  resetGh();
  const photos = { gallery: [{ id: "g1", name: "ithaca", photos: [photo("keep"), photo("new-one")] }], commercial: [] };
  const [status, out] = await call("save", { method: "POST", body: JSON.stringify({ base: "d1", photos, uploads: [{ name: "new-one", large: "a".repeat(40), small: "c".repeat(40) }] }) });
  assert.equal(status, 200, JSON.stringify(out));
  const paths = Object.fromEntries(gh.trees[0].tree.map((e) => [e.path, e.sha]));
  assert.equal(paths["images/photos/new-one.webp"], "a".repeat(40));
  assert.equal(paths["images/photos/new-one-700.webp"], "c".repeat(40));
  assert.equal(paths["images/photos/old-one.webp"], null);      // no roll uses it any more
  assert.equal(paths["images/photos/old-one-700.webp"], null);
  assert.ok(!("images/photos/keep.webp" in paths));            // still used: left alone
  assert.ok("data/photos.json" in paths);
  assert.deepEqual(gh.commits[0].parents, ["d1"]);
  assert.equal(gh.refs.drafts, "c1");
  assert.equal(gh.refs.main, "m1");                            // the live site is untouched
});
await test("save refuses if drafts moved since the desk opened", async () => {
  resetGh();
  const [status] = await call("save", { method: "POST", body: JSON.stringify({ base: "stale", photos: { gallery: [], commercial: [] } }) });
  assert.equal(status, 409);
  assert.equal(gh.commits.length, 0);
});
await test("save refuses an upload that isn't in any roll", async () => {
  resetGh();
  const [status] = await call("save", { method: "POST", body: JSON.stringify({ base: "d1", photos: { gallery: [], commercial: [] }, uploads: [{ name: "stray", large: "a".repeat(40), small: "a".repeat(40) }] }) });
  assert.equal(status, 500);
  assert.equal(gh.commits.length, 0);
});
await test("publish merges drafts into main, then levels drafts with it", async () => {
  resetGh();
  const [status] = await call("publish", { method: "POST", body: JSON.stringify({ base: "d1" }) });
  assert.equal(status, 200);
  assert.deepEqual(gh.merges[0], { base: "main", head: "drafts", commit_message: "desk: publish" });
  assert.equal(gh.refs.drafts, "merge1");
});
await test("file only serves photo files", async () => {
  resetGh();
  const [status] = await call("file?path=" + encodeURIComponent("data/photos.json"));
  assert.equal(status, 400);
});

console.log(results.join("\n"));
