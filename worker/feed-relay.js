// Cloudflare Worker: a tiny relay that fetches Shravan's Substack for the GitHub sync job.
//
// Why: Substack sits behind Cloudflare's bot protection, which blocks GitHub's data-center
// machines. This code runs *inside* Cloudflare's network, so its requests get through.
//
// How it's used:   GET https://<worker>.workers.dev/?url=<https address>
//                  with header  X-Relay-Key: <secret>
// It only fetches a short list of Substack addresses (never anything else), and only for
// requests carrying the secret key, so it can't be used as an open proxy.
//
// The secret lives in the Worker's settings as RELAY_KEY (never in this file).

const ALLOWED = [
  // the publication's feed, post list and individual posts
  { host: "shrvvn.substack.com", path: /^\/(feed|api\/v1\/archive|api\/v1\/posts\/[a-z0-9-]{1,151})$/ },
  // images inside posts
  { host: "substackcdn.com", path: /^\/image\// },
  { host: "substack-post-media.s3.amazonaws.com", path: /^\/public\// },
];
const MAX_BYTES = 20 * 1024 * 1024;

// Compares two strings in constant time, so the key can't be guessed by timing the answer.
function sameKey(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default {
  async fetch(request, env) {
    if (request.method !== "GET") return new Response("method not allowed", { status: 405 });
    if (!env.RELAY_KEY || !sameKey(request.headers.get("X-Relay-Key") || "", env.RELAY_KEY)) {
      return new Response("forbidden", { status: 403 });
    }
    let target;
    try {
      target = new URL(new URL(request.url).searchParams.get("url") || "");
    } catch {
      return new Response("bad url", { status: 400 });
    }
    const ok = target.protocol === "https:" && !target.username && !target.password && !target.port &&
      ALLOWED.some((r) => r.host === target.hostname && r.path.test(target.pathname));
    if (!ok) return new Response("not allowed", { status: 403 });

    const upstream = await fetch(target.toString(), {
      headers: { "User-Agent": "shravanlad-site-sync/1.0 (+https://github.com/shhravan/personal-website)" },
      redirect: "follow",
    });
    const len = Number(upstream.headers.get("content-length") || 0);
    if (len > MAX_BYTES) return new Response("too large", { status: 413 });
    // Pass back the body and status; keep only the content type from Substack's headers.
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
                 "Cache-Control": "no-store" },
    });
  },
};
