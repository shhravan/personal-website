// The photography landing: two film cans you pick from, film that pours out and buries the page,
// then pulls taut through the rows and develops into the gallery. Loaded by script.js (startPhotography)
// only on the photography page. three.js is vendored in /vendor (MIT licence), since the site's
// security policy only runs scripts from this site.
import * as THREE from "../vendor/three.module.min.js";
import { RoomEnvironment } from "../vendor/RoomEnvironment.js";

// ---------- canvas helpers ----------
const W = 2048, H = 1044;   // body label: 78.5mm round, 40mm tall
function cv(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; }
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function speckle(g, w, h, n, col, a, s = 2) { g.save(); g.fillStyle = col; for (let i = 0; i < n; i++) { g.globalAlpha = a * rnd(); g.fillRect(rnd() * w, rnd() * h, s * rnd() + .5, s * rnd() + .5); } g.restore(); }
function wear(g, w, h, amt) {
  // print rubbed through to bare tin along the rims and in patches, fine scratches, grime
  g.save();
  const rim = (y, dir) => { const gr = g.createLinearGradient(0, y, 0, y + dir * 30); gr.addColorStop(0, `rgba(205,200,188,${.55 * amt})`); gr.addColorStop(1, "rgba(205,200,188,0)"); g.fillStyle = gr; g.fillRect(0, Math.min(y, y + dir * 30), w, 30); };
  rim(0, 1); rim(h, -1);
  for (let i = 0; i < 26 * amt; i++) { g.globalAlpha = .25 * amt * rnd(); g.fillStyle = "#cfc9bb"; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 8 + rnd() * 40, 3 + rnd() * 10, rnd() * 3, 0, 7); g.fill(); }
  g.globalAlpha = 1; g.lineWidth = 1;
  for (let i = 0; i < 160 * amt; i++) { g.strokeStyle = `rgba(235,230,220,${.35 * rnd()})`; const x = rnd() * w, y = rnd() * h, l = 10 + rnd() * 90, a = rnd() * 6.28; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l * .3); g.stroke(); }
  speckle(g, w, h, 9000 * amt, "#3b2c1c", .18);
  speckle(g, w, h, 4000 * amt, "#fff", .12);
  g.restore();
}
function text(g, s, x, y, font, col, ls = 0, align = "center") { g.font = font; g.fillStyle = col; g.textAlign = align; g.textBaseline = "alphabetic"; if ("letterSpacing" in g) g.letterSpacing = ls + "px"; g.fillText(s, x, y); if ("letterSpacing" in g) g.letterSpacing = "0px"; }

const PHI = 100 * Math.PI / 180;   // where round the can the slot is
const FEED = 42;   // px a second: how fast the film runs through the rows once taut, like the strips after it

// ---------- label artwork: a shop roll, pantone 1235 c, the two-line capital lockup up the side ----------
const C = W / 2;
function label(g, roll) {
  // a shop roll: pantone 1235 c, the two-line capital lockup running up the can, a dark band by the slot
  const base = "#ffb81c", ink = "#11110f";
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  const gl = g.createLinearGradient(0, 0, 0, H); gl.addColorStop(0, "rgba(255,255,255,.06)"); gl.addColorStop(1, "rgba(0,0,0,.06)"); g.fillStyle = gl; g.fillRect(0, 0, W, H);
  const fam = "'Schibsted Grotesk'", wt = "900 ";
  // one size for both lines and both cans, set by the longest word, like a real lockup
  g.font = `${wt}300px ${fam}`; const longest = Math.max(g.measureText("CLIENT").width, g.measureText("SHRVN").width);
  const px = Math.floor(300 * Math.min(1, 860 / longest)), lead = px * .9;
  const v = (str, x, y, font, col, ls = 0, align = "left") => { g.save(); g.translate(x, y); g.rotate(-Math.PI / 2); text(g, str, 0, 0, font, col, ls, align); g.restore(); };
  const start = H / 2 - 430;   // left-aligned lockup reads from the bottom of the can up
  v("SHRVN", C + 40, H - start, `${wt}${px}px ${fam}`, ink, -6);
  v(roll ? "CLIENT" : "FILM", C + 40 + lead, H - start, `${wt}${px}px ${fam}`, ink, -6);
  v(roll ? "35MM SLIDE FILM  ·  E-6  ·  24 EXP" : "35MM COLOUR PRINT FILM  ·  36 EXP", C - 300, H - start, "700 34px 'Albert Sans'", ink, 4);
  // dark band beside the slot, with contact squares top and bottom
  const bx = C + 470, bw = 230;
  g.fillStyle = ink; g.fillRect(bx, 0, bw, H);
  [[60, 1], [130, 0], [H - 200, 0], [H - 130, 1]].forEach(([y, o]) => { for (let k = 0; k < 3; k++) { g.fillStyle = (k + o) % 2 ? "#d9d4c7" : "#2a2925"; g.fillRect(bx + 18 + k * 66, y, 58, 58); } });
  v(roll ? "100" : "400", bx + 150, H / 2, `${wt}110px ${fam}`, base, 0, "center");
  // back: barcode and small print
  for (let k = 0, x = 120; k < 46; k++) { const w = 3 + Math.floor(rnd() * 3) * 4; g.fillStyle = ink; if (k % 2 === 0) g.fillRect(x, 300, w, 330); x += w + 4; }
  text(g, roll ? "SLIDE · PROCESS E-6 · 24 EXP" : "COLOUR NEGATIVE · PROCESS C-41 · 36 EXP", 330, 690, "700 30px 'Albert Sans'", ink, 4);
  text(g, "SHRVN 135 · " + (roll ? "100" : "400") + " · LOAD IN SUBDUED LIGHT", 330, 740, "500 28px 'Albert Sans'", ink, 3);
  wear(g, W, H, .12);
}

function roughMap(amt) {
  const [c, g] = cv(512, 256); g.fillStyle = "#888"; g.fillRect(0, 0, 512, 256);
  speckle(g, 512, 256, 6000, "#fff", .25 * amt); speckle(g, 512, 256, 6000, "#000", .25 * amt);
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; return t;
}

// ---------- geometry ----------
const R = 12.6, BODY_H = 40;
function lidGeometry() {
  // the cap's profile, turned round: lip, ribbed wall, a slightly dished face
  const p = [[0, 3.2], [3.6, 3.2], [4.2, 3.05], [11.6, 3.05], [12.6, 3.25], [13.25, 3.1], [13.55, 2.75], [13.6, 0.5], [13.4, 0.1], [12.6, 0]].map(([x, y]) => new THREE.Vector2(x, y));
  const geo = new THREE.LatheGeometry(p, 260);
  const pos = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = Math.hypot(v.x, v.z), a = Math.atan2(v.z, v.x);
    if (r > 13.45 && v.y > 0.55 && v.y < 2.7) { const k = 1 + 0.0055 * Math.sign(Math.sin(a * 65)); v.x *= k; v.z *= k; pos.setXYZ(i, v.x, v.y, v.z); }
  }
  geo.computeVertexNormals();
  return geo;
}
const LID = lidGeometry();
function leaderTextures(roll) {
  // film base colour with faint edge print; alpha cuts the sprocket holes and the leader's tongue
  const L = 30, Wd = 35, px = 30, cw = L * px, ch = Wd * px;
  const [c, g] = cv(cw, ch), [a, ga] = cv(cw, ch);
  const base = ["#121110", "#2a2926", "#121110"];   // black-and-white film
  const gr = g.createLinearGradient(0, 0, 0, ch); gr.addColorStop(0, base[0]); gr.addColorStop(.5, base[1]); gr.addColorStop(1, base[2]);
  g.fillStyle = gr; g.fillRect(0, 0, cw, ch);
  text(g, "SHRVN " + (roll ? "100  E-6" : "400  C-41") + "  ▸ 0", 60, 2.6 * px, "400 38px 'Share Tech Mono'", "rgba(236,232,222,.55)", 6, "left");
  ga.fillStyle = "#fff"; ga.fillRect(0, 0, cw, ch);
  ga.fillStyle = "#000";
  for (let x = 1.2; x < L - 1; x += 4.75) { [2.0, Wd - 2.0 - 1.98].forEach((y) => { ga.beginPath(); ga.roundRect(x * px, y * px, 2.8 * px, 1.98 * px, .5 * px); ga.fill(); }); }
  // tongue: the last 9mm keeps only the bottom half, with a curved shoulder
  ga.beginPath(); ga.moveTo((L - 12) * px, 0); ga.quadraticCurveTo((L - 9) * px, 0, (L - 9) * px, Wd * .48 * px); ga.lineTo(L * px, Wd * .48 * px); ga.lineTo(L * px, 0); ga.closePath(); ga.fill();
  ga.beginPath(); ga.moveTo(L * px, Wd * .48 * px); ga.lineTo(L * px, Wd * .48 * px + 2.5 * px); ga.quadraticCurveTo(L * px, Wd * .48 * px, (L - 2.5) * px, Wd * .48 * px); ga.fill();
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace;
  return [map, new THREE.CanvasTexture(a)];
}
function leaderGeometry() {
  // out of the felt slot on the right side, tangent to the can, curling gently toward you
  const L = 30, Wd = 35, nx = 48, phi = 100 * Math.PI / 180;
  const P = new THREE.Vector3(R * Math.sin(phi), 0, R * Math.cos(phi)), T = new THREE.Vector3(-Math.cos(phi), 0, Math.sin(phi));
  const N = new THREE.Vector3(Math.sin(phi), 0, Math.cos(phi));
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= nx; i++) {
    const s = i / nx * L, c = P.clone().addScaledVector(T, s).addScaledVector(N, 0.006 * s * s + 0.15);
    for (let j = 0; j <= 1; j++) { pos.push(c.x, 2.5 + j * Wd, c.z); uv.push(i / nx, j); }
  }
  for (let i = 0; i < nx; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
}
const LEADER = leaderGeometry();

function blankFilm() {
  // black-and-white film: dark base, clear sprocket holes, faint frame edges, white edge printing
  const FW = 278, LEN = FW * 3, [c, g] = cv(LEN, 256), [ac, ag] = cv(LEN, 256);
  g.fillStyle = "#151412"; g.fillRect(0, 0, LEN, 256);
  for (let x = 0; x < LEN; x += FW) { g.fillStyle = "#1f1e1b"; g.fillRect(x + 12, 40, FW - 24, 176); g.strokeStyle = "rgba(255,255,255,.07)"; g.lineWidth = 2; g.strokeRect(x + 12, 40, FW - 24, 176); }
  g.fillStyle = "rgba(236,232,222,.55)"; g.font = "15px 'Share Tech Mono'";
  for (let k = 0; k < 3; k++) { g.fillText("SHRVN 400  ▸ " + (k * 2 + 1) + "A", k * FW + 30, 33); g.fillText(String(k * 2 + 2), k * FW + 230, 252); }
  ag.fillStyle = "#fff"; ag.fillRect(0, 0, LEN, 256); ag.fillStyle = "#000";
  for (let x = 6; x < LEN; x += FW / 8) { ag.beginPath(); ag.roundRect(x, 11, 20, 15, 3); ag.fill(); ag.beginPath(); ag.roundRect(x, 230, 20, 15, 3); ag.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 8;
  const am = new THREE.CanvasTexture(ac); am.wrapS = THREE.RepeatWrapping;
  t.userData = { len: LEN, alpha: am };
  return t;
}
// a loose, natural unrolling: the film leaves the slot and wanders in big lazy loops,
// steering toward whatever part of the page is still bare, until the page is buried
function loosePath(o, W2, H2, w) {
  const cell = w * .9, cols = Math.ceil(W2 / cell) + 2, rows = Math.ceil(H2 / cell) + 2, seen = new Float32Array(cols * rows);
  const mark = (x, y) => { const cx = Math.floor(x / cell) + 1, cy = Math.floor(y / cell) + 1; if (cx >= 0 && cy >= 0 && cx < cols && cy < rows) seen[cy * cols + cx] += 1; };
  const pts = []; let x = o.x, y = o.y, a = .35, z = 0, tx = 0, ty = 0, s = 0, next = 0;
  const step = 12, Ltarget = W2 * H2 / w * 6.2, Rmin = w * .82, p1 = Math.random() * 9, p2 = Math.random() * 9;
  while (s < Ltarget) {
    if (s >= next) {   // pick the barest spot as the next place to drift toward
      let best = 1e9; for (let k = 0; k < 40; k++) { const qx = Math.random() * W2, qy = Math.random() * H2, v = seen[(Math.floor(qy / cell) + 1) * cols + Math.floor(qx / cell) + 1] + Math.hypot(qx - x, qy - y) / (W2 * 1.5); if (v < best) { best = v; tx = qx; ty = qy; } }
      next = s + 350 + Math.random() * 300;
    }
    let d = Math.atan2(ty - y, tx - x) - a; d = Math.atan2(Math.sin(d), Math.cos(d));
    const wander = (Math.sin(s * .0026 + p1) * .7 + Math.sin(s * .0067 + p2) * .45) / (w * 1.25);   // lazy loops
    const k = Math.max(-1 / Rmin, Math.min(1 / Rmin, wander + d * .006));
    a += k * step; x += Math.cos(a) * step; y += Math.sin(a) * step; s += step;
    z = Math.sin(s * .0024 + p1) * 60 + Math.sin(s * .0061) * 25;
    if (pts.length === 0 || s % 36 < step) pts.push(new THREE.Vector3(x, -y, z));
    mark(x, y);
  }
  return pts;
}

function startPour(o) {
  const cvs = document.createElement("canvas"); cvs.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:25";
  document.body.appendChild(cvs);
  const W2 = innerWidth, H2 = innerHeight;
  const r2 = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, alpha: true });
  r2.setPixelRatio(Math.min(devicePixelRatio, 2)); r2.setSize(W2, H2, false); r2.outputColorSpace = THREE.SRGBColorSpace;
  r2.toneMapping = THREE.ACESFilmicToneMapping;
  const sc = new THREE.Scene(), pm = new THREE.PMREMGenerator(r2);
  sc.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  const dl = new THREE.DirectionalLight(0xffffff, 1.5); dl.position.set(-.5, .9, 1); sc.add(dl);
  // a real perspective camera, set so the z = 0 plane lines up with the page's pixels
  const fov = 30, dist = (H2 / 2) / Math.tan(fov / 2 * Math.PI / 180);
  const cam = new THREE.PerspectiveCamera(fov, W2 / H2, 10, dist * 3); cam.position.set(W2 / 2, -H2 / 2, dist); cam.lookAt(W2 / 2, -H2 / 2, 0);
  const wFly = Math.max(110, Math.min(230, o.w || 180)); let rh = wFly;
  const curve = new THREE.CatmullRomCurve3(loosePath(o, W2, H2, wFly), false, "centripetal"), Lc = curve.getLength();
  const SEG = Math.min(4000, Math.round(Lc / 6));
  const P = [], T = [], TH = [], ph = Math.random() * 6;
  for (let s = 0; s <= SEG; s++) { const f = s / SEG; P.push(curve.getPointAt(f)); T.push(curve.getTangentAt(f)); TH.push(Math.sin(f * Lc * .0016 + ph) * .85); }
  // the taut path: through the gallery rows, turning round just off the screen's edges
  let target = null, Lt = 1;
  function setRows(rects) {
    if (!rects.length) return;
    rh = rects[0].height;
    const path = [], turn = 160;
    rects.forEach((r, k) => {
      const y = -(r.top + r.height / 2), l = -turn, rr = W2 + turn, xs = k % 2 ? [rr, l] : [l, rr];
      for (let j = 0; j <= 8; j++) path.push(new THREE.Vector3(xs[0] + (xs[1] - xs[0]) * j / 8, y, 0));
    });
    const tc = new THREE.CatmullRomCurve3(path, false, "catmullrom", .1); Lt = tc.getLength();
    target = []; for (let s = 0; s <= SEG; s++) target.push({ p: tc.getPointAt(s / SEG), t: tc.getTangentAt(s / SEG) });
  }
  const geo = new THREE.BufferGeometry(), pos = new Float32Array((SEG + 1) * 6), nor = new Float32Array((SEG + 1) * 6), uv = new Float32Array((SEG + 1) * 4), idx = [];
  for (let s = 0; s < SEG; s++) { const b = s * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx);
  const map = blankFilm();
  const mat = new THREE.MeshPhysicalMaterial({ map, alphaMap: map.userData.alpha, alphaTest: .5, side: THREE.DoubleSide, roughness: .35, metalness: 0, clearcoat: .7, clearcoatRoughness: .18 });
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; sc.add(mesh);
  const Z = new THREE.Vector3(0, 0, 1), v = new THREE.Vector3(), tq = new THREE.Vector3(), n0 = new THREE.Vector3(), b0 = new THREE.Vector3(), B = new THREE.Vector3(), N = new THREE.Vector3();
  const inout = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, grow = (x) => 1 - Math.pow(1 - x, 1.6);
  const t0 = performance.now(); let tautAt = 0, alive = true, fade = 0;
  function draw(now) {
    if (!alive) return;
    const g = Math.min(1, Math.max(0, grow(Math.min(1, (now - t0) / 2000))));
    const e = target ? inout(Math.min(1, (now - tautAt) / 900)) : 0;
    const w = wFly + (rh - wFly) * e, L = Lc + (Lt - Lc) * e, count = Math.max(1, Math.round(g * SEG)), texLen = map.userData.len * w / 256;
    const feed = target ? FEED * (now - tautAt) / 1000 : 0;   // once taut it keeps running, like film through a projector
    for (let s = 0; s <= SEG; s++) {
      const f = s / SEG, k = Math.min(SEG, Math.max(0, count - s));   // the end that left the can first leads
      v.copy(P[k]); tq.copy(T[k]).negate();
      if (e > 0) { const tg = target[SEG - s]; v.lerp(tg.p, e); tq.lerp(tg.t.clone().negate(), e).normalize(); }
      n0.copy(Z).addScaledVector(tq, -Z.dot(tq)); if (n0.lengthSq() < 1e-6) n0.set(0, 1, 0); n0.normalize();
      b0.crossVectors(tq, n0);
      const th = TH[k] * (1 - e), c = Math.cos(th), si = Math.sin(th);
      B.copy(b0).multiplyScalar(c).addScaledVector(n0, si); N.copy(n0).multiplyScalar(c).addScaledVector(b0, -si);
      const o6 = s * 6;
      pos[o6] = v.x - B.x * w / 2; pos[o6 + 1] = v.y - B.y * w / 2; pos[o6 + 2] = v.z - B.z * w / 2;
      pos[o6 + 3] = v.x + B.x * w / 2; pos[o6 + 4] = v.y + B.y * w / 2; pos[o6 + 5] = v.z + B.z * w / 2;
      nor[o6] = nor[o6 + 3] = N.x; nor[o6 + 1] = nor[o6 + 4] = N.y; nor[o6 + 2] = nor[o6 + 5] = N.z;
      const u = (f * L + feed) / texLen; uv[s * 4] = u; uv[s * 4 + 1] = 1; uv[s * 4 + 2] = u; uv[s * 4 + 3] = 0;
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.normal.needsUpdate = true; geo.attributes.uv.needsUpdate = true;
    geo.setDrawRange(0, count * 6);
    cvs.style.opacity = 1 - fade;
    r2.render(sc, cam);
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
  return {
    straighten(rects) { setRows(rects); tautAt = performance.now(); },
    done(now) {
      if (now) { alive = false; geo.dispose(); map.dispose(); map.userData.alpha.dispose(); mat.dispose(); pm.dispose(); r2.dispose(); cvs.remove(); return; }
      const t1 = performance.now();
      const out = (now) => { fade = Math.min(1, (now - t1) / 450); if (fade < 1 && alive) requestAnimationFrame(out); else { alive = false; geo.dispose(); map.dispose(); map.userData.alpha.dispose(); mat.dispose(); pm.dispose(); r2.dispose(); cvs.remove(); } };
      requestAnimationFrame(out);
    },
  };
}

// ---------- fonts for the labels ----------
// The page may have been reached by a page swap (theme.js), which doesn't bring a new <head>,
// so the label fonts are added here, then waited for (never more than 2.5 seconds).
let fontsLoaded = null;
export function ready() {
  if (fontsLoaded) return fontsLoaded;
  // wait for the stylesheet itself first: until it has arrived the browser doesn't know these fonts exist
  const sheet = new Promise((res) => {
    const l = document.createElement("link");
    l.rel = "stylesheet"; l.onload = l.onerror = res;
    l.href = "https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@900&family=Albert+Sans:wght@500;700&family=Share+Tech+Mono&display=block";
    document.head.appendChild(l);
  });
  const want = ["900 300px 'Schibsted Grotesk'", "500 40px 'Albert Sans'", "700 30px 'Albert Sans'", "400 38px 'Share Tech Mono'"];
  fontsLoaded = Promise.race([sheet.then(() => Promise.all(want.map((f) => document.fonts.load(f)))), new Promise((r) => setTimeout(r, 3000))]);
  return fontsLoaded;
}

// ---------- one can, as a lit 3D object ----------
function makeCan(roll) {
  seed = 11 + roll * 5;
  const g = new THREE.Group(), inner = new THREE.Group();
  g.add(inner);
  const [c, ctx] = cv(W, H); label(ctx, roll);
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; map.wrapS = THREE.RepeatWrapping; map.offset.x = 0.5; map.anisotropy = 8;
  const rm = roughMap(1); rm.offset.x = .5;
  // toneMapped off on the label so the yellow stays true pantone 1235 c
  const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, BODY_H, 160, 1, true),
    new THREE.MeshPhysicalMaterial({ map, toneMapped: false, metalness: .15, roughness: .28, roughnessMap: rm, clearcoat: .35, clearcoatRoughness: .35 }));
  body.position.y = BODY_H / 2 + 3; body.castShadow = true; inner.add(body);
  const lidMat = new THREE.MeshPhysicalMaterial({ color: 0x0e0e0e, metalness: 0, roughness: .3, roughnessMap: roughMap(.5) });
  const top = new THREE.Mesh(LID, lidMat); top.position.y = BODY_H + 2.9; top.castShadow = true; inner.add(top);
  const bot = new THREE.Mesh(LID, lidMat); bot.rotation.x = Math.PI; bot.position.y = 3.15; bot.castShadow = true; inner.add(bot);
  // spool end: black plastic, with the slot a camera's rewind fork grabs
  const plastic = new THREE.MeshPhysicalMaterial({ color: 0x0d0d0d, roughness: .45, metalness: 0, clearcoat: .4 });
  const spool = new THREE.Mesh(new THREE.CylinderGeometry(4.1, 4.1, 7, 48), plastic); spool.position.y = BODY_H + 8.7; spool.castShadow = true; inner.add(spool);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.2, 1.1), new THREE.MeshBasicMaterial({ color: 0x000000 })); slot.position.y = BODY_H + 11.8; inner.add(slot);
  // felt light trap along the slot
  const felt = new THREE.Mesh(new THREE.BoxGeometry(0.8, BODY_H - 2, 3.4), new THREE.MeshStandardMaterial({ color: 0x0b0a09, roughness: 1 }));
  felt.position.set(R * Math.sin(PHI), BODY_H / 2 + 3, R * Math.cos(PHI)); felt.rotation.y = PHI; inner.add(felt);
  const [lm, la] = leaderTextures(roll);
  const leader = new THREE.Mesh(LEADER, new THREE.MeshPhysicalMaterial({ map: lm, alphaMap: la, alphaTest: .5, side: THREE.DoubleSide, roughness: .22, metalness: 0, clearcoat: 1, clearcoatRoughness: .1 }));
  leader.castShadow = true; inner.add(leader);
  g.userData = { inner, leader, lift: 0, liftTo: 0, pull: 0, pullTo: 0, dim: 0, dimTo: 0 };
  return g;
}

// ---------- the landing ----------
// root: the .cans section. tabs: the page's (hidden) tab buttons, which really switch the panes.
// Returns a function that stops everything (for page swaps).
export function start(root, tabs) {
  const glCanvas = root.querySelector(".cans-gl"), stage = root.querySelector(".cans-stage");
  const names = [...root.querySelectorAll(".can-name")], skipBtn = root.querySelector(".cans-skip");
  const body = document.body, still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(), pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(24, 1, 1, 1000);
  camera.position.set(0, 34, 175); camera.lookAt(0, 20, 0);
  const key = new THREE.DirectionalLight(0xfff4e2, 2.2);
  key.position.set(-60, 120, 90); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -80, right: 80, top: 80, bottom: -80 });
  key.shadow.radius = 8; key.shadow.bias = -0.0005; scene.add(key);
  const rim = new THREE.DirectionalLight(0xdfe8ff, 0.9); rim.position.set(80, 60, -80); scene.add(rim);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({ opacity: .22 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const darkMq = matchMedia("(prefers-color-scheme: dark)");
  const isDark = () => document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : darkMq.matches;

  const cans = [0, 1].map((roll) => { const c = makeCan(roll); c.position.x = roll ? 30 : -30; scene.add(c); return c; });
  let active = -1, busy = false, timers = [], pour = null, raf = 0, alive = true;
  const later = (f, ms) => timers.push(setTimeout(f, ms));

  function toScreen(v) { v.project(camera); const r = glCanvas.getBoundingClientRect(); return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height }; }
  function slot(c) {   // where the film leaves the can, and how wide 35mm film is there on screen
    const at = (y) => toScreen(c.userData.inner.localToWorld(new THREE.Vector3(R * Math.sin(PHI) + 4, y, R * Math.cos(PHI) + 8)));
    const top = at(37.5), bot = at(2.5);
    return { x: (top.x + bot.x) / 2, y: (top.y + bot.y) / 2, w: Math.hypot(top.x - bot.x, top.y - bot.y) };
  }
  const strips = () => [...document.querySelectorAll(".photo-pane:not([hidden]) .roll canvas")];
  function showPane(i) { if (tabs[i]) tabs[i].click(); }
  function develop() {
    // the frames come up like a print in the tray
    const pane = document.querySelector(".photo-pane:not([hidden])");
    if (pane && !still) pane.animate([{ filter: "sepia(1) brightness(1.5) blur(4px)", opacity: .2 }, { filter: "none", opacity: 1 }], { duration: 1000, easing: "ease-out" });
  }
  function mark(i) {
    names.forEach((n, k) => { n.setAttribute("aria-pressed", k === i ? "true" : "false"); });
    cans.forEach((c, k) => { c.userData.liftTo = k === i ? 1 : 0; c.userData.pullTo = k === i ? .35 : 0; c.userData.dimTo = k === i ? 0 : .5; });
    try { sessionStorage.setItem("photo-roll", String(i)); } catch (e) { /* private mode: just replay next time */ }
  }
  function settle(i) {
    busy = false; body.classList.remove("cans-pouring"); skipBtn.hidden = true;
    if (pour) { pour.done(); pour = null; }
    mark(i);
  }
  function open(i) {
    if (busy || i === active) return;
    const first = active < 0; active = i;
    timers.forEach(clearTimeout); timers = [];
    if (!first) { showPane(i); develop(); mark(i); return; }   // the quick version: the new roll develops in
    if (still) { body.classList.add("cans-picked"); showPane(i); mark(i); return; }
    busy = true; body.classList.add("cans-pouring"); skipBtn.hidden = false;
    cans.forEach((c, k) => { c.userData.liftTo = k === i ? 1 : 0; c.userData.pullTo = k === i ? 1 : 0; c.userData.dimTo = k === i ? 0 : .5; });
    const o = slot(cans[i]);
    later(() => { pour = startPour(o); }, 200);
    later(() => {
      // under the film: the cans step back to become the switch, and the roll's strips appear
      body.classList.add("cans-picked"); showPane(i);
      requestAnimationFrame(() => { if (pour) pour.straighten(strips().map((s) => s.getBoundingClientRect())); });
    }, 2250);
    later(() => { settle(i); develop(); }, 3200);
  }
  function skip() { if (!busy) return; timers.forEach(clearTimeout); timers = []; body.classList.add("cans-picked"); showPane(active); settle(active); develop(); }
  names.forEach((n, i) => n.addEventListener("click", () => open(i)));
  skipBtn.addEventListener("click", skip);

  // hover lifts a can; a click (not a drag) opens it; dragging turns both
  const ray = new THREE.Raycaster(), m = new THREE.Vector2(), turn = { a: -0.35, v: 0, down: false, x: 0, moved: 0 };
  function hitCan(e) {
    const r = glCanvas.getBoundingClientRect(); m.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(m, camera); const h = ray.intersectObjects(cans, true)[0]; if (!h) return -1;
    let ob = h.object; while (ob && !cans.includes(ob)) ob = ob.parent; return cans.indexOf(ob);
  }
  glCanvas.addEventListener("pointerdown", (e) => { turn.down = true; turn.x = e.clientX; turn.moved = 0; glCanvas.setPointerCapture(e.pointerId); });
  glCanvas.addEventListener("pointerup", (e) => { turn.down = false; if (turn.moved < 6) { const k = hitCan(e); if (k >= 0) open(k); } });
  glCanvas.addEventListener("pointercancel", () => { turn.down = false; });
  glCanvas.addEventListener("pointermove", (e) => {
    if (turn.down) { const dx = e.clientX - turn.x; turn.x = e.clientX; turn.moved += Math.abs(dx); turn.v = dx * .01; turn.a += dx * .01; }
    if (busy || e.pointerType !== "mouse") return;
    const k = hitCan(e); glCanvas.style.cursor = k >= 0 ? "pointer" : "grab";
    cans.forEach((c, j) => c.userData.liftTo = j === k || j === active ? 1 : 0);
  });
  glCanvas.addEventListener("pointerleave", () => { if (!busy) cans.forEach((c, j) => c.userData.liftTo = j === active ? 1 : 0); });

  function resize() {
    const w = glCanvas.clientWidth, h = glCanvas.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.position.z = Math.max(175, 76 / (Math.tan(12 * Math.PI / 180) * camera.aspect));   // far enough back that both cans and the film tongue fit the width
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize);
  let last = performance.now(); const t0 = last;
  function frame(t) {
    if (!alive) return;
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    if (!turn.down) { turn.a += turn.v; turn.v *= .92; if (!still) turn.a += Math.sin((t - t0) / 2600) * .0016; }
    floor.material.opacity = isDark() ? .45 : .22;
    // the name under each can follows it, at both sizes (main is drawn smaller on desktop, so undo that)
    const rr = root.getBoundingClientRect(), scale = rr.width / (root.offsetWidth || rr.width) || 1;
    cans.forEach((c, i) => {
      const u = c.userData, k = 1 - Math.exp(-dt * 9);
      u.lift += (u.liftTo - u.lift) * k; u.pull += (u.pullTo - u.pull) * k; u.dim += (u.dimTo - u.dim) * k;
      u.inner.rotation.y = turn.a + (i ? .5 : 0);
      c.position.y = u.lift * 5; u.inner.rotation.z = u.lift * (i ? .03 : -.03);
      u.leader.position.set((Math.sin(PHI) - .17) * u.pull * 7, 0, (Math.cos(PHI) + .98) * u.pull * 7);
      c.scale.setScalar(1 - u.dim * .12);
      const p = toScreen(c.localToWorld(new THREE.Vector3(0, -2, 0)));
      names[i].style.left = (p.x - rr.left) / scale + "px"; names[i].style.top = (p.y - rr.top) / scale + 14 + "px";
    });
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  // coming back during this visit: go straight to the roll you were on, no pour
  let seen = null; try { seen = sessionStorage.getItem("photo-roll"); } catch (e) { /* no storage */ }
  resize();
  if (seen !== null) { active = +seen || 0; body.classList.add("cans-picked"); showPane(active); mark(active); cans.forEach((c) => { c.userData.lift = c.userData.liftTo; c.userData.dim = c.userData.dimTo; c.userData.pull = c.userData.pullTo; }); }
  raf = requestAnimationFrame(frame);

  return () => {
    alive = false; cancelAnimationFrame(raf); timers.forEach(clearTimeout);
    if (pour) { pour.done(true); pour = null; }
    removeEventListener("resize", resize);
    body.classList.remove("cans-picked", "cans-pouring");
    scene.traverse((o) => { if (o.geometry && o.geometry !== LID && o.geometry !== LEADER) o.geometry.dispose(); if (o.material) { o.material.map?.dispose(); o.material.alphaMap?.dispose(); o.material.roughnessMap?.dispose(); o.material.dispose(); } });
    pmrem.dispose(); renderer.dispose();
  };
}
