// The desk: edit the photography rolls, add photos, save to drafts, publish to the live site.
//
// How it fits together:
//   - On open, GET /api/state gives us data/photos.json from the `drafts` branch, plus `base`
//     (which drafts commit that is) and how many saves aren't live yet.
//   - Every edit changes `data` in memory and marks the page as having unsaved changes.
//   - New photos are made into webp files right here (photo.js) and wait in `pending`.
//   - Save uploads the pending files one by one, then sends the whole photos.json in one save.
//   - Publish asks the server to merge drafts into main (the live site).
// The server (functions/api/[[path]].js) checks the login and every field again; this page is
// only the friendly part.

import { develop, placeFor } from "./photo.js";

const $ = (s, root = document) => root.querySelector(s);
const KINDS = { gallery: "film gallery", commercial: "commercial" };

let data = null, base = null, unpublished = 0, preview = null;
let kind = "gallery", dirty = false, busy = false, working = 0;
const pending = new Map();   // photo name → { large, small, thumb } waiting to be saved

// ---------- small helpers ----------

function el(tag, props = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") n.className = v;
    else if (k === "on") for (const [ev, fn] of Object.entries(v)) n.addEventListener(ev, fn);
    else if (k in n) n[k] = v;
    else n.setAttribute(k, v);
  }
  n.append(...kids.filter((x) => x != null));
  return n;
}

async function api(path, opts = {}) {
  const r = await fetch("/api/" + path, {
    ...opts,
    headers: { "X-Desk": "1", ...(opts.json ? { "Content-Type": "application/json" } : {}), ...(opts.headers || {}) },
    body: opts.json ? JSON.stringify(opts.json) : opts.body,
  });
  const out = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(out.error || "something went wrong (" + r.status + ")"), { status: r.status });
  return out;
}

function toast(msg) {
  const t = el("div", { class: "toast", role: "alert" }, msg);
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 4500);
}

const rollsOf = (k = kind) => data[k];
const allRolls = () => [...data.gallery, ...data.commercial];
const thumbUrl = (p) => (pending.get(p.name) || {}).thumb || "/api/file?path=" + encodeURIComponent(p.dir + "/" + p.name + "-700.webp");
const fullUrl = (p) => (pending.get(p.name) || {}).full || "/api/file?path=" + encodeURIComponent(p.dir + "/" + p.name + ".webp");

function changed() {
  dirty = true;
  status();
}

function status() {
  const s = $(".bar .status");
  let msg;
  if (working) msg = "developing " + working + (working === 1 ? " photo…" : " photos…");
  else if (busy) msg = busy;
  else if (dirty) msg = "unsaved changes";
  else if (unpublished) msg = "saved to drafts · not live yet";
  else msg = "everything is live";
  s.textContent = msg;
  s.classList.toggle("is-dirty", dirty && !busy);
  $(".save").disabled = !dirty || !!busy || working > 0;
  $(".publish").disabled = dirty || !!busy || working > 0 || !unpublished;
}

// ---------- drawing the rolls ----------

function render() {
  const box = $(".rolls");
  box.textContent = "";
  rollsOf().forEach((roll, i) => box.appendChild(rollCard(roll, i)));
  $(".new-roll").hidden = false;
  document.querySelectorAll(".tabs button").forEach((b) => b.setAttribute("aria-selected", b.dataset.kind === kind ? "true" : "false"));
}

function rollCard(roll, i) {
  const list = rollsOf();
  const card = el("section", { class: "roll-card" + (roll.hidden ? " is-hidden" : "") });
  const name = el("input", { class: "roll-name", value: roll.name, maxLength: 80, "aria-label": "roll name", on: { input: (e) => { roll.name = e.target.value; changed(); } } });
  const head = el("div", { class: "roll-head" },
    el("span", { class: "roll-no" }, kind === "gallery" ? "roll " + String(i + 1).padStart(2, "0") : "project"),
    name);
  if (kind === "commercial") {
    head.appendChild(el("div", { class: "roll-meta" },
      el("input", { value: roll.client || "", placeholder: "client", maxLength: 60, "aria-label": "client", on: { input: (e) => { roll.client = e.target.value; changed(); } } }),
      el("input", { value: roll.year || "", placeholder: "year", maxLength: 12, inputMode: "numeric", "aria-label": "year", on: { input: (e) => { roll.year = e.target.value; changed(); } } })));
  }
  const move = (d) => { list.splice(i, 1); list.splice(i + d, 0, roll); changed(); render(); };
  head.appendChild(el("div", { class: "roll-tools" },
    el("label", { class: "check" }, el("input", { type: "checkbox", checked: roll.hidden, on: { change: (e) => { roll.hidden = e.target.checked; changed(); render(); } } }), "hidden"),
    el("span", { class: "grow" }),
    el("button", { type: "button", disabled: i === 0, "aria-label": "move roll up", on: { click: () => move(-1) } }, "↑"),
    el("button", { type: "button", disabled: i === list.length - 1, "aria-label": "move roll down", on: { click: () => move(1) } }, "↓"),
    el("button", { type: "button", class: "danger", on: { click: () => deleteRoll(roll) } }, "delete")));
  card.appendChild(head);

  const thumbs = el("ol", { class: "thumbs", "aria-label": "photos on " + (roll.name || "this roll") });
  roll.photos.forEach((p, k) => {
    const img = el("img", { src: thumbUrl(p), alt: p.caption || "photo " + (k + 1), loading: "lazy" });
    thumbs.appendChild(el("li", {}, el("button", { type: "button", class: "thumb" + (p.hidden ? " is-hidden" : ""), on: { click: () => openEditor(roll, k) } },
      img, p.hidden ? el("span", { class: "tag" }, "hidden") : pending.has(p.name) ? el("span", { class: "tag" }, "new") : null)));
  });
  for (let w = 0; w < (roll._working || 0); w++) thumbs.appendChild(el("li", {}, el("div", { class: "thumb is-working" }, "developing…")));
  const input = el("input", { type: "file", accept: "image/*", multiple: true, on: { change: (e) => { addPhotos(roll, [...e.target.files]); e.target.value = ""; } } });
  thumbs.appendChild(el("li", {}, el("label", { class: "add" }, "+ add photos", input)));
  card.appendChild(thumbs);
  return card;
}

function deleteRoll(roll) {
  const n = roll.photos.length;
  if (n && !confirm("delete \"" + (roll.name || "this roll") + "\" and its " + n + " photo" + (n === 1 ? "" : "s") + "? (nothing changes on the live site until you publish.)")) return;
  const list = rollsOf();
  list.splice(list.indexOf(roll), 1);
  roll.photos.forEach((p) => pending.delete(p.name));
  changed();
  render();
}

$(".new-roll").addEventListener("click", () => {
  const roll = { id: kind[0] + Date.now().toString(36), name: "", hidden: true, photos: [] };
  if (kind === "commercial") Object.assign(roll, { client: "", year: String(new Date().getFullYear()) });
  rollsOf().push(roll);
  changed();
  render();
  const inputs = document.querySelectorAll(".roll-name");
  inputs[inputs.length - 1].focus();
  toast("new rolls start hidden. untick hidden when it's ready to show.");
});

document.querySelectorAll(".tabs button").forEach((b) => b.addEventListener("click", () => { kind = b.dataset.kind; render(); }));

// ---------- adding photos ----------

function newName(date) {
  const d = date || new Date();
  const taken = new Set(allRolls().flatMap((r) => r.photos.map((p) => p.name)));
  let n;
  do {
    n = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0") + "-" + Math.random().toString(36).slice(2, 6);
  } while (taken.has(n));
  return n;
}

async function addPhotos(roll, files) {
  roll._working = (roll._working || 0) + files.length;
  working += files.length;
  status();
  render();
  for (const file of files) {
    try {
      const out = await develop(file);
      const m = out.meta;
      const name = newName(m.date);
      pending.set(name, { large: out.large, small: out.small, thumb: URL.createObjectURL(out.small), full: URL.createObjectURL(out.large) });
      const photo = { name, dir: "images/photos", caption: "", alt: "", place: "", year: m.year, film: "", camera: m.camera, settings: m.settings, focus: [50, 50, 1], hidden: false };
      photo._found = [m.year, m.camera, m.lens, m.settings].filter(Boolean);
      roll.photos.push(photo);
      if (m.gps) placeFor(m.gps).then((place) => {
        if (place && !photo.place) { photo.place = place; photo._found.push("near " + place); if (editing && editing.photo === photo) fillEditor(); }
      }).catch(() => {});
      dirty = true;
    } catch (e) {
      toast("couldn't open " + file.name + ": " + (e.message || "unknown problem") + ". try a jpeg.");
    }
    roll._working--;
    working--;
    status();
    if (kind === (data.gallery.includes(roll) ? "gallery" : "commercial")) render();
  }
}

// ---------- the photo editor ----------

const ed = $(".editor");
let editing = null;   // { roll, k, photo }

function openEditor(roll, k) {
  editing = { roll, k, photo: roll.photos[k] };
  fillEditor();
  if (!ed.open) ed.showModal();
}

function fillEditor() {
  const { roll, k, photo } = editing;
  $(".ed-count", ed).textContent = "photo " + (k + 1) + " of " + roll.photos.length;
  const img = $(".focus img", ed);
  if (img.dataset.name !== photo.name) { img.src = fullUrl(photo); img.dataset.name = photo.name; }
  img.alt = photo.alt || photo.caption || "";
  for (const f of ["caption", "place", "year", "film", "camera", "settings", "alt"]) ed.querySelector("[name=" + f + "]").value = photo[f] || "";
  $("[name=alt]", ed).placeholder = photo.caption || "";
  $("[name=zoom]", ed).value = photo.focus[2];
  $("[name=hidden]", ed).checked = photo.hidden;
  const sel = $("[name=roll]", ed);
  sel.textContent = "";
  rollsOf().forEach((r, i) => sel.appendChild(el("option", { value: i, selected: r === roll }, r.name || "untitled roll " + (i + 1))));
  $(".found", ed).textContent = photo._found && photo._found.length ? "from the photo: " + photo._found.join(" · ") : "";
  $(".ed-earlier", ed).disabled = k === 0;
  $(".ed-later", ed).disabled = k === roll.photos.length - 1;
  placeDot();
}

// The dot shows the point of the photo the strip keeps in view (photo.focus x and y, in %).
function placeDot() {
  const img = $(".focus img", ed), dot = $(".focus-dot", ed);
  const [x, y] = editing.photo.focus;
  if (!img.naturalWidth) { dot.hidden = true; return; }
  // the image is letterboxed inside its box (object-fit: contain), so work out where it really sits
  const s = Math.min(img.clientWidth / img.naturalWidth, img.clientHeight / img.naturalHeight);
  const w = img.naturalWidth * s, h = img.naturalHeight * s;
  dot.hidden = false;
  dot.style.left = img.offsetLeft + (img.clientWidth - w) / 2 + w * x / 100 + "px";
  dot.style.top = img.offsetTop + (img.clientHeight - h) / 2 + h * y / 100 + "px";
}
$(".focus img", ed).addEventListener("load", placeDot);
window.addEventListener("resize", () => { if (ed.open) placeDot(); });
$(".focus img", ed).addEventListener("click", (e) => {
  const img = e.currentTarget, r = img.getBoundingClientRect();
  const s = Math.min(r.width / img.naturalWidth, r.height / img.naturalHeight);
  const w = img.naturalWidth * s, h = img.naturalHeight * s;
  const x = (e.clientX - r.left - (r.width - w) / 2) / w * 100, y = (e.clientY - r.top - (r.height - h) / 2) / h * 100;
  editing.photo.focus[0] = Math.round(Math.min(100, Math.max(0, x)));
  editing.photo.focus[1] = Math.round(Math.min(100, Math.max(0, y)));
  placeDot();
  changed();
});

ed.addEventListener("input", (e) => {
  const f = e.target.name, p = editing.photo;
  if (["caption", "place", "year", "film", "camera", "settings", "alt"].includes(f)) p[f] = e.target.value;
  else if (f === "zoom") p.focus[2] = Number(e.target.value);
  else return;
  changed();
});
$("[name=hidden]", ed).addEventListener("change", (e) => { editing.photo.hidden = e.target.checked; changed(); });
$("[name=roll]", ed).addEventListener("change", (e) => {
  const to = rollsOf()[Number(e.target.value)], { roll, k, photo } = editing;
  roll.photos.splice(k, 1);
  to.photos.push(photo);
  editing = { roll: to, k: to.photos.length - 1, photo };
  changed();
  fillEditor();
});
function shift(d) {
  const { roll, k, photo } = editing;
  roll.photos.splice(k, 1);
  roll.photos.splice(k + d, 0, photo);
  editing.k = k + d;
  changed();
  fillEditor();
}
$(".ed-earlier", ed).addEventListener("click", () => shift(-1));
$(".ed-later", ed).addEventListener("click", () => shift(1));
function step(d) {
  const { roll, k } = editing;
  openEditor(roll, (k + d + roll.photos.length) % roll.photos.length);
}
$(".ed-prev", ed).addEventListener("click", () => step(-1));
$(".ed-next", ed).addEventListener("click", () => step(1));
ed.addEventListener("keydown", (e) => {
  if (e.target.matches("input, textarea, select")) return;
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});
$(".ed-delete", ed).addEventListener("click", () => {
  const { roll, k, photo } = editing;
  if (!confirm("delete this photo? (it stays on the live site until you publish.)")) return;
  roll.photos.splice(k, 1);
  pending.delete(photo.name);
  changed();
  ed.close();
});
$(".ed-close", ed).addEventListener("click", () => ed.close());
ed.addEventListener("close", () => { editing = null; render(); });

// ---------- save and publish ----------

// Only the fields the site uses go into photos.json (no _working, _found and so on).
function cleanData() {
  const photo = ({ name, dir, caption, alt, place, year, film, camera, settings, focus, hidden }) => ({ name, dir, caption, alt, place, year, film, camera, settings, focus, hidden });
  const roll = (r) => ({ id: r.id, name: r.name, hidden: r.hidden, ...(r.client !== undefined ? { client: r.client, year: r.year } : {}), photos: r.photos.map(photo) });
  return { version: 1, gallery: data.gallery.map(roll), commercial: data.commercial.map(roll) };
}

$(".save").addEventListener("click", async () => {
  const clean = cleanData();
  const inUse = new Set([...clean.gallery, ...clean.commercial].flatMap((r) => r.photos.map((p) => p.name)));
  const todo = [...pending.entries()].filter(([name]) => inUse.has(name));
  const uploads = [];
  try {
    for (let i = 0; i < todo.length; i++) {
      busy = "uploading photo " + (i + 1) + " of " + todo.length + "…";
      status();
      const [name, f] = todo[i];
      const large = await api("blob", { method: "POST", body: f.large, headers: { "Content-Type": "image/webp" } });
      const small = await api("blob", { method: "POST", body: f.small, headers: { "Content-Type": "image/webp" } });
      uploads.push({ name, large: large.sha, small: small.sha });
    }
    busy = "saving…";
    status();
    const out = await api("save", { method: "POST", json: { base, photos: clean, uploads, message: "desk: update photos" } });
    base = out.base;
    unpublished = out.unpublished;
    todo.forEach(([name]) => pending.delete(name));   // their thumbnails now come from drafts
    dirty = false;
    toast(preview ? "saved. the drafts preview updates in a minute or two." : "saved to drafts.");
  } catch (e) {
    toast(e.status === 409 ? e.message : "couldn't save: " + e.message);
  }
  busy = false;
  status();
  render();
});

$(".publish").addEventListener("click", async () => {
  if (!confirm("publish your saved changes to shravanlad.com?")) return;
  busy = "publishing…";
  status();
  try {
    const out = await api("publish", { method: "POST", json: { base } });
    base = out.base;
    unpublished = 0;
    toast("published. shravanlad.com updates in a minute or two.");
  } catch (e) {
    toast("couldn't publish: " + e.message);
  }
  busy = false;
  status();
});

window.addEventListener("beforeunload", (e) => { if (dirty || working) e.preventDefault(); });

// ---------- start ----------

async function start() {
  try {
    const s = await api("state");
    data = s.photos;
    base = s.base;
    unpublished = s.unpublished;
    preview = s.preview;
    if (preview && /^https:\/\//.test(preview)) {
      const a = $(".preview-link");
      a.href = preview.replace(/\/$/, "") + "/photography/";
      a.hidden = false;
    }
    $(".loading").remove();
    render();
  } catch (e) {
    $(".loading").textContent = e.status === 403
      ? "you're not signed in, or this desk isn't set up yet (see _desk/README.md)."
      : "couldn't open the desk: " + e.message;
  }
  status();
}
start();
