// Turns a photo from your phone or computer into the two files the site uses, on your device,
// before anything is uploaded:
//   NAME.webp      at most 2560px on the long side, for the full-screen view (sharp on retina laptops)
//   NAME-700.webp  700px wide, for the film strips and phones
// Encoded with libwebp (the same encoder Google ships) at high quality, so the photo looks the same
// as the original on screen. Only the pixels are kept, so the camera's hidden metadata, including
// GPS location, never leaves your device. Before that, we read the useful parts of it (year,
// camera, settings, place) to fill in the details for you to edit.

import { parse } from "./vendor/exifr-lite.js";
import encode from "./vendor/webp/encode.js";

export const LARGE = 2560, SMALL = 700;

export async function develop(file) {
  let tags = {};
  try { tags = (await parse(file, { tiff: true, exif: true, gps: true })) || {}; } catch { /* no metadata: fine */ }
  let bmp;
  try { bmp = await createImageBitmap(file, { imageOrientation: "from-image" }); }   // turn it the right way up
  catch { bmp = await createImageBitmap(file); }
  const s = Math.min(1, LARGE / Math.max(bmp.width, bmp.height));
  const large = await webp(bmp, Math.round(bmp.width * s), Math.round(bmp.height * s), 90);
  const w = Math.min(SMALL, bmp.width);
  const small = await webp(bmp, w, Math.round(bmp.height * w / bmp.width), 82);
  const size = [bmp.width, bmp.height];
  bmp.close();
  return { large, small, size, meta: readMeta(tags) };
}

// Shrinks in halves, then once more to the exact size: a big jump in one go makes fine detail
// (leaves, hair, film grain) shimmer, halving keeps it smooth.
function shrink(src, w, h) {
  let cur = src, cw = src.width, ch = src.height;
  while (cw / 2 >= w && ch / 2 >= h) {
    cw = Math.round(cw / 2); ch = Math.round(ch / 2);
    cur = draw(cur, cw, ch);
  }
  return draw(cur, w, h);
}
function draw(src, w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d");
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = "high";
  g.drawImage(src, 0, 0, w, h);
  return c;
}

async function webp(bmp, w, h, quality) {
  const c = shrink(bmp, w, h);
  try {
    const data = c.getContext("2d").getImageData(0, 0, w, h);
    const buf = await encode(data, { quality, method: 4, use_sharp_yuv: 1 });   // sharp_yuv: crisper colour edges
    return new Blob([buf], { type: "image/webp" });
  } catch {
    // If the encoder can't load, use the browser's own (Chrome and Firefox can; Safari can't).
    const b = await new Promise((ok) => c.toBlob(ok, "image/webp", quality / 100));
    if (!b || b.type !== "image/webp") throw new Error("this browser couldn't make a webp file");
    return b;
  }
}

// ---------- what the photo says about itself ----------

function readMeta(t) {
  const when = t.DateTimeOriginal || t.CreateDate || t.ModifyDate;
  const date = when instanceof Date && !isNaN(when) ? when : null;
  const make = String(t.Make || "").trim(), model = String(t.Model || "").trim();
  let camera = "";
  if (model) camera = /apple/i.test(make) || model.toLowerCase().includes(make.toLowerCase().split(" ")[0]) ? model : make + " " + model;
  const settings = [];
  if (t.ExposureTime) settings.push(t.ExposureTime >= 1 ? t.ExposureTime + "s" : "1/" + Math.round(1 / t.ExposureTime));
  if (t.FNumber) settings.push("f" + Math.round(t.FNumber * 10) / 10);
  const iso = t.ISO || t.ISOSpeedRatings;
  if (iso) settings.push("iso " + (Array.isArray(iso) ? iso[0] : iso));
  if (t.FocalLength) settings.push(Math.round(t.FocalLength) + "mm");
  return {
    date,
    year: date ? String(date.getFullYear()) : "",
    camera: camera.replace(/\s+/g, " ").toLowerCase().slice(0, 60),
    lens: String(t.LensModel || "").toLowerCase().slice(0, 60),
    settings: settings.join(" · "),
    gps: Number.isFinite(t.latitude) && Number.isFinite(t.longitude) ? [t.latitude, t.longitude] : null,
  };
}

// The town and region for a GPS point, from OpenStreetMap's free lookup (one request a second at
// most, as they ask). Only the place name is kept; the coordinates are never saved.
let lastLookup = 0;
export async function placeFor([lat, lon]) {
  const wait = lastLookup + 1100 - Date.now();
  lastLookup = Date.now() + Math.max(0, wait);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  const r = await fetch("https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&accept-language=en&lat=" + lat.toFixed(3) + "&lon=" + lon.toFixed(3));
  if (!r.ok) return "";
  const a = (await r.json()).address || {};
  const town = a.city || a.town || a.village || a.municipality || a.county || "";
  return [town, a.state || a.country].filter(Boolean).join(", ").toLowerCase();
}
