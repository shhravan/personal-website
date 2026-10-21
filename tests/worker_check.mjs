// Exercises worker/feed-relay.js with a fake `fetch`, no Cloudflare needed. Run by test_worker.py.
import worker from "../worker/feed-relay.js";

const KEY = "k".repeat(40);
let fetched = [];
globalThis.fetch = async (url) => { fetched.push(url); return new Response("ok", { status: 200, headers: { "content-type": "text/plain" } }); };
const call = (u, key = KEY, method = "GET") =>
  worker.fetch(new Request(`https://relay.example/?url=${encodeURIComponent(u)}`, { method, headers: key ? { "X-Relay-Key": key } : {} }), { RELAY_KEY: KEY });

const cases = [
  ["https://shrvvn.substack.com/feed", KEY, "GET", 200],
  ["https://shrvvn.substack.com/api/v1/archive", KEY, "GET", 200],
  ["https://shrvvn.substack.com/api/v1/posts/hello-world", KEY, "GET", 200],
  ["https://substackcdn.com/image/fetch/x.png", KEY, "GET", 200],
  ["https://shrvvn.substack.com/feed", null, "GET", 403],                 // no key
  ["https://shrvvn.substack.com/feed", "wrong", "GET", 403],              // wrong key
  ["https://shrvvn.substack.com/feed", KEY.slice(0, -1) + "x", "GET", 403],
  ["https://shrvvn.substack.com/feed", KEY, "POST", 405],
  ["https://evil.example/", KEY, "GET", 403],                             // not on the list
  ["https://shrvvn.substack.com/account/login", KEY, "GET", 403],         // other paths
  ["https://shrvvn.substack.com/api/v1/posts/../../x", KEY, "GET", 403],
  ["http://shrvvn.substack.com/feed", KEY, "GET", 403],                   // not https
  ["https://shrvvn.substack.com.evil.example/feed", KEY, "GET", 403],     // look-alike host
  ["https://user:pw@shrvvn.substack.com/feed", KEY, "GET", 403],
  ["https://shrvvn.substack.com:8443/feed", KEY, "GET", 403],
  ["https://169.254.169.254/latest/meta-data", KEY, "GET", 403],          // cloud metadata
  ["not a url", KEY, "GET", 400],
];
let failed = 0;
for (const [u, key, method, want] of cases) {
  fetched = [];
  const r = await call(u, key, method);
  const leaked = want !== 200 && fetched.length > 0;
  if (r.status !== want || leaked) { failed++; console.log(`FAIL ${method} ${u} key=${key ? key.slice(0, 4) : "none"} -> ${r.status} (want ${want})${leaked ? " and it fetched upstream" : ""}`); }
}
const noKeyEnv = await worker.fetch(new Request("https://relay.example/?url=" + encodeURIComponent("https://shrvvn.substack.com/feed"), { headers: { "X-Relay-Key": "" } }), {});
if (noKeyEnv.status !== 403) { failed++; console.log("FAIL: worker without RELAY_KEY configured must refuse everything"); }
console.log(failed ? `${failed} failed` : "all worker checks passed");
process.exit(failed ? 1 : 0);
