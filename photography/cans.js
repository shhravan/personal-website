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
const FEED = 42;
const POUR_MS = 3000;   // how long the film takes to bury the page   // px a second: how fast the film runs through the rows once taut, like the strips after it

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
  // the two columns together (cap height about .72 of the size, one line-gap apart) are centred on the front of the can
  const x1 = C - .09 * px - 20;
  v("SHRVN", x1, H - start, `${wt}${px}px ${fam}`, ink, -6);
  v(roll ? "CLIENT" : "FILM", x1 + lead, H - start, `${wt}${px}px ${fam}`, ink, -6);
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

// Black-and-white film with the roll's own photos in the frames: dark base, clear sprocket holes,
// white edge printing. Drawn blank at once, then each photo is added as it downloads.
const FRAME = 278;   // one frame on the texture (the film is 256 tall), a real 35mm frame's shape
function filmTexture(names) {
  const n = Math.max(3, names.length), LEN = FRAME * n, [c, g] = cv(LEN, 256), [ac, ag] = cv(LEN, 256);
  g.fillStyle = "#151412"; g.fillRect(0, 0, LEN, 256);
  for (let k = 0; k < n; k++) {
    const x = k * FRAME; g.fillStyle = "#1f1e1b"; g.fillRect(x + 12, 40, FRAME - 24, 176);
    g.fillStyle = "rgba(236,232,222,.55)"; g.font = "15px 'Share Tech Mono'";
    g.fillText("SHRVN 400  ▸ " + (k + 1) + "A", x + 30, 33); g.fillText(String(k + 1), x + 230, 252);
  }
  ag.fillStyle = "#fff"; ag.fillRect(0, 0, LEN, 256); ag.fillStyle = "#000";
  for (let x = 6; x < LEN; x += FRAME / 8) { ag.beginPath(); ag.roundRect(x, 11, 20, 15, 3); ag.fill(); ag.beginPath(); ag.roundRect(x, 230, 20, 15, 3); ag.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 8;
  const am = new THREE.CanvasTexture(ac); am.wrapS = THREE.RepeatWrapping;
  t.userData = { len: LEN, alpha: am };
  names.forEach((name, k) => {
    const im = new Image();
    im.onload = () => {
      const x = k * FRAME + 12, w = FRAME - 24, h = 176, r = im.width / im.height;
      let sw = im.width, sh = im.height, sx = 0, sy = 0;
      if (r > w / h) { sw = im.height * w / h; sx = (im.width - sw) / 2; } else { sh = im.width * h / w; sy = (im.height - sh) / 2; }
      g.drawImage(im, sx, sy, sw, sh, x, 40, w, h); t.needsUpdate = true;
    };
    im.src = new URL("../images/hero/" + name + "-700.webp", import.meta.url).href;
  });
  return t;
}
// The path the film lands along: out of the slot, then a few long, gently curving sweeps across the
// page, turning round just past the edges, one band under the next, until the page is covered.
// Fewer, calmer passes than a tangle of loops, and they straighten naturally into the gallery rows.
function sweepPath(o, W2, H2, w) {
  const passes = Math.max(3, Math.ceil(H2 / (w * .82))), band = H2 / passes, edge = w * .9, ph = Math.random() * 6;
  // out along the tongue: rightwards, within a sensible angle, and long enough that the film never folds at the slot
  let a = Math.atan2(o.dy || 0, o.dx || 1); a = Math.max(-.7, Math.min(.45, a));
  const ux = Math.cos(a), uy = Math.sin(a), L1 = w * 1.1;
  const pts = [new THREE.Vector3(o.x, -o.y, 0), new THREE.Vector3(o.x + ux * L1, -(o.y + uy * L1), 0),
    new THREE.Vector3(o.x + ux * L1 * 2.2 + w * .3, -(o.y + uy * L1 * 2.2) + w * .55, 15)];
  for (let r = 0; r < passes; r++) {
    const y = band * (r + .5), left = r % 2 === 0;   // the film leaves the can heading right, so the first sweep runs right to left
    for (let j = 0; j <= 6; j++) {
      const f = j / 6, x = left ? W2 + edge - f * (W2 + 2 * edge) : -edge + f * (W2 + 2 * edge);
      pts.push(new THREE.Vector3(x, -(y + Math.sin(f * Math.PI * 1.6 + r * 1.7 + ph) * band * .14), Math.sin(f * Math.PI + r) * 50));
    }
  }
  return pts;
}

// The pour's 3D setup is built once, while the cans are on screen, and its shaders compiled then,
// so nothing heavy happens at the moment of the click (that was the stutter at the start).
function pourKit(rolls) {
  const cvs = document.createElement("canvas");
  cvs.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:25;display:none";
  document.body.appendChild(cvs);
  const r2 = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, alpha: true, powerPreference: "high-performance" });
  r2.setPixelRatio(Math.min(devicePixelRatio, 1.5)); r2.outputColorSpace = THREE.SRGBColorSpace; r2.toneMapping = THREE.ACESFilmicToneMapping;
  const sc = new THREE.Scene(), pm = new THREE.PMREMGenerator(r2);
  sc.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  const dl = new THREE.DirectionalLight(0xffffff, 1.1); dl.position.set(-.5, .9, 1); sc.add(dl);
  const maps = rolls.map(filmTexture), map = maps[0];
  // standard (not physical) material: one lighting pass instead of two, much lighter with many layers of film on top of each other
  const mat = new THREE.MeshBasicMaterial({ map, alphaMap: map.userData.alpha, alphaTest: .5, side: THREE.DoubleSide, vertexColors: true, toneMapped: false, depthTest: false, depthWrite: false });
  const geo = new THREE.BufferGeometry(), mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; sc.add(mesh);
  const cam = new THREE.PerspectiveCamera(30, 1, 10, 10000);
  r2.compile(sc, cam);
  return { cvs, r2, sc, pm, maps, mat, geo, mesh, cam, dispose() { geo.dispose(); maps.forEach((m) => { m.dispose(); m.userData.alpha.dispose(); }); mat.dispose(); pm.dispose(); r2.dispose(); cvs.remove(); } };
}
function startPour(kit, o, roll) {
  const { cvs, r2, sc, cam, mat } = kit, map = kit.maps[roll] || kit.maps[0];
  mat.map = map; mat.alphaMap = map.userData.alpha; mat.needsUpdate = true;
  const W2 = innerWidth, H2 = innerHeight;
  r2.setSize(W2, H2, false); cvs.style.opacity = 1; cvs.style.display = "block";
  // a real perspective camera, set so the z = 0 plane lines up with the page's pixels
  const dist = (H2 / 2) / Math.tan(15 * Math.PI / 180);
  cam.aspect = W2 / H2; cam.far = dist * 3; cam.position.set(W2 / 2, -H2 / 2, dist); cam.lookAt(W2 / 2, -H2 / 2, 0); cam.updateProjectionMatrix();
  const wFly = W2 < 700 ? Math.max(110, Math.min(170, W2 * .42)) : Math.max(150, Math.min(280, Math.max(o.w || 0, H2 / 3.6))); let rh = wFly;
  const curve = new THREE.CatmullRomCurve3(sweepPath(o, W2, H2, wFly), false, "centripetal", .5), Lc = curve.getLength();
  const w0 = Math.max(40, Math.min(wFly, o.w || wFly));   // the tongue's width on screen, where the film comes out
  const SEG = Math.min(2600, Math.round(Lc / 10)), taper = Math.max(1, SEG * 520 / Lc);
  // every sample along the film, kept in flat arrays (no new objects while it moves)
  const P = new Float32Array((SEG + 1) * 3), T = new Float32Array((SEG + 1) * 3), TH = new Float32Array(SEG + 1), ph = Math.random() * 6;
  const pts = curve.getSpacedPoints(SEG);
  for (let s = 0; s <= SEG; s++) {
    const f = s / SEG, t = curve.getTangentAt(f);
    P[s * 3] = pts[s].x; P[s * 3 + 1] = pts[s].y; P[s * 3 + 2] = pts[s].z; T[s * 3] = t.x; T[s * 3 + 1] = t.y; T[s * 3 + 2] = t.z;
    TH[s] = Math.sin(f * Lc * .0011 + ph) * .3;
  }
  // the taut path: through the gallery rows, turning round just off the screen's edges
  let TP = null, TT = null, Lt = 1;
  function setRows(rects) {
    if (!rects.length) return;
    rh = rects[0].height;
    const path = [], turn = 160;
    rects.forEach((r, k) => {
      const y = -(r.top + r.height / 2), l = -turn, rr = W2 + turn, xs = k % 2 ? [rr, l] : [l, rr];
      for (let j = 0; j <= 8; j++) path.push(new THREE.Vector3(xs[0] + (xs[1] - xs[0]) * j / 8, y, 0));
    });
    const tc = new THREE.CatmullRomCurve3(path, false, "catmullrom", .1); Lt = tc.getLength();
    const tp = tc.getSpacedPoints(SEG); TP = new Float32Array((SEG + 1) * 3); TT = new Float32Array((SEG + 1) * 3);
    for (let s = 0; s <= SEG; s++) { const t = tc.getTangentAt(s / SEG); TP[s * 3] = tp[s].x; TP[s * 3 + 1] = tp[s].y; TP[s * 3 + 2] = tp[s].z; TT[s * 3] = t.x; TT[s * 3 + 1] = t.y; TT[s * 3 + 2] = t.z; }
  }
  const geo = kit.geo, pos = new Float32Array((SEG + 1) * 6), nor = new Float32Array((SEG + 1) * 6), uv = new Float32Array((SEG + 1) * 4), idx = new Uint32Array(SEG * 6);
  for (let s = 0; s < SEG; s++) { const b = s * 2, o6 = s * 6; idx[o6] = b; idx[o6 + 1] = b + 1; idx[o6 + 2] = b + 2; idx[o6 + 3] = b + 1; idx[o6 + 4] = b + 3; idx[o6 + 5] = b + 2; }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2).setUsage(THREE.DynamicDrawUsage));
  const col = new Float32Array((SEG + 1) * 6);
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage));
  const LX = -.36, LY = .56, LZ = .75;   // where the light comes from (up, left, in front)
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  // a steady, eased speed: it starts gently, runs, and slows as the last of it lands
  const ease = (x) => -(Math.cos(Math.PI * x) - 1) / 2, inout = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const t0 = performance.now(); let tautAt = 0, alive = true, fade = 0, raf = 0;
  const POUR = POUR_MS / 1000;
  function draw(now) {
    if (!alive) return;
    const g = ease(Math.min(1, (now - t0) / POUR_MS));
    const e = TP ? inout(Math.min(1, (now - tautAt) / 1000)) : 0, ie = 1 - e;
    const w = wFly + (rh - wFly) * e, hwT = w / 2, L = Lc + (Lt - Lc) * e, count = Math.max(1, Math.round(g * SEG)), texLen = map.userData.len * w / 256;
    const feed = TP ? FEED * (now - tautAt) / 1000 : 0;   // once taut it keeps running, like film through a projector
    const last = e > 0 ? SEG : count;   // only the film that's out of the can needs working out
    for (let s = 0; s <= last; s++) {
      const k = s * 3;   // laid from the can outward: what has landed stays where it landed
      // the newest stretch is still in the air: it drops onto the pile and settles over a moment
      const age = Math.max(0, (g - s / SEG) * POUR), drop = e > 0 ? 0 : Math.exp(-age / .22) * Math.min(1, s / taper);   // the first stretch stays attached to the slot
      let vx = P[k], vy = P[k + 1] + 22 * drop, vz = P[k + 2] + 90 * drop, tx = T[k], ty = T[k + 1], tz = T[k + 2];
      if (e > 0) { vx = vx * ie + TP[k] * e; vy = vy * ie + TP[k + 1] * e; vz = vz * ie + TP[k + 2] * e; tx = tx * ie + TT[k] * e; ty = ty * ie + TT[k + 1] * e; tz = tz * ie + TT[k + 2] * e; const l = Math.hypot(tx, ty, tz) || 1; tx /= l; ty /= l; tz /= l; }
      // "across the film": the screen-facing direction square to the film's path, then twisted a little
      let nx = -tz * tx, ny = -tz * ty, nz = 1 - tz * tz; const nl = Math.hypot(nx, ny, nz); if (nl < 1e-4) { nx = 0; ny = 1; nz = 0; } else { nx /= nl; ny /= nl; nz /= nl; }
      const bx = ty * nz - tz * ny, by = tz * nx - tx * nz, bz = tx * ny - ty * nx;
      const th = (TH[s] + drop * .35) * ie, c = Math.cos(th), si = Math.sin(th);
      const Bx = bx * c + nx * si, By = by * c + ny * si, Bz = bz * c + nz * si;
      const o6 = s * 6, hw = e > 0 ? hwT : (w0 + (wFly - w0) * Math.min(1, s / taper)) / 2;
      pos[o6] = vx - Bx * hw; pos[o6 + 1] = vy - By * hw; pos[o6 + 2] = vz - Bz * hw;
      pos[o6 + 3] = vx + Bx * hw; pos[o6 + 4] = vy + By * hw; pos[o6 + 5] = vz + Bz * hw;
      const Nx = nx * c - bx * si, Ny = ny * c - by * si, Nz = nz * c - bz * si;
      nor[o6] = nor[o6 + 3] = Nx; nor[o6 + 1] = nor[o6 + 4] = Ny; nor[o6 + 2] = nor[o6 + 5] = Nz;
      const sh = .7 + .3 * Math.abs(Nx * LX + Ny * LY + Nz * LZ);   // either face: film is lit the same from both sides
      col[o6] = col[o6 + 1] = col[o6 + 2] = col[o6 + 3] = col[o6 + 4] = col[o6 + 5] = sh;
      // on sweeps running right to left the picture would come out upside down; show it as film seen from the back instead
      const u = (s / SEG * L - feed) / texLen, up = tx < 0 ? 0 : 1; uv[s * 4] = u; uv[s * 4 + 1] = up; uv[s * 4 + 2] = u; uv[s * 4 + 3] = 1 - up;
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.normal.needsUpdate = true; geo.attributes.uv.needsUpdate = true; geo.attributes.color.needsUpdate = true;
    geo.setDrawRange(0, count * 6);
    cvs.style.opacity = 1 - fade;
    r2.render(sc, cam);
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
  const stop = () => { alive = false; cancelAnimationFrame(raf); cvs.style.display = "none"; geo.setDrawRange(0, 0); };
  return {
    covered: () => performance.now() - t0 > POUR_MS * .55,
    straighten(rects) { setRows(rects); tautAt = performance.now(); },
    done(now) {
      if (now) return stop();
      const t1 = performance.now();
      const out = (t) => { fade = Math.min(1, (t - t1) / 320); if (fade < 1 && alive) requestAnimationFrame(out); else stop(); };
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

  const cans = [0, 1].map((roll) => { const c = makeCan(roll); c.position.x = roll ? 29 : -31; scene.add(c); return c; });
  let active = -1, busy = false, timers = [], pour = null, raf = 0, alive = true, kit = null;
  const backBtn = root.querySelector(".cans-back");
  const later = (f, ms) => timers.push(setTimeout(f, ms));

  function toScreen(v) { v.project(camera); const r = glCanvas.getBoundingClientRect(); return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height }; }
  function slot(c) {   // where the film leaves the can, how wide it is there on screen, and which way the tongue points
    const u = c.userData, at = (v) => toScreen(u.inner.localToWorld(v));
    const P = (y) => new THREE.Vector3(R * Math.sin(PHI), y, R * Math.cos(PHI));
    const T = new THREE.Vector3(-Math.cos(PHI), 0, Math.sin(PHI)), N = new THREE.Vector3(Math.sin(PHI), 0, Math.cos(PHI));
    const off = new THREE.Vector3((Math.sin(PHI) - .17) * u.pull * 7, 0, (Math.cos(PHI) + .98) * u.pull * 7);
    const top = at(P(37.5)), bot = at(P(2.5)), base = at(P(20)), tip = at(P(20).addScaledVector(T, 30).addScaledVector(N, 5.5).add(off));
    return { x: base.x, y: base.y, w: Math.hypot(top.x - bot.x, top.y - bot.y), dx: tip.x - base.x, dy: tip.y - base.y };
  }
  const strips = () => [...document.querySelectorAll(".photo-pane:not([hidden]) .roll canvas")];
  // the photos printed on each can's film: that set's own pictures, in order
  const rollPhotos = () => [...document.querySelectorAll(".photo-pane")].map((p) => [...p.querySelectorAll(".roll-list button")].map((b) => b.dataset.name).slice(0, 12));
  function showPane(i) { if (tabs[i]) tabs[i].click(); }
  function develop() {
    // the frames come up like a print in the tray
    const pane = document.querySelector(".photo-pane:not([hidden])");
    if (pane && !still) pane.animate([{ filter: "saturate(.25) brightness(.85) blur(3px)", opacity: .55 }, { filter: "none", opacity: 1 }], { duration: 900, easing: "ease-out" });
  }
  function mark(i) {
    names.forEach((n, k) => { n.setAttribute("aria-pressed", k === i ? "true" : "false"); });
    cans.forEach((c, k) => { c.userData.liftTo = k === i ? 1 : 0; c.userData.pullTo = k === i ? .35 : 0; c.userData.dimTo = k === i ? 0 : .5; });
  }
  function settle(i) {
    busy = false; body.classList.remove("cans-pouring"); skipBtn.hidden = true;
    if (pour) { pour.done(); pour = null; }
    cans.forEach((c) => { c.userData.leader.visible = true; });
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
    later(() => { cans[i].userData.leader.visible = false; pour = startPour(kit || (kit = pourKit(rollPhotos())), slot(cans[i]), i); }, 180);
    later(() => {
      // under the film: the cans step back to become the switch, and the roll's strips appear
      body.classList.add("cans-picked"); showPane(i);
      requestAnimationFrame(() => { if (pour) pour.straighten(strips().map((s) => s.getBoundingClientRect())); });
    }, 180 + POUR_MS + 150);
    later(() => { settle(i); develop(); }, 180 + POUR_MS + 1300);
  }
  function skip() { if (!busy) return; timers.forEach(clearTimeout); timers = []; body.classList.add("cans-picked"); showPane(active); settle(active); develop(); }
  names.forEach((n, i) => n.addEventListener("click", () => open(i)));
  // back to the two big cans; picking again plays the pour again
  function back() {
    if (busy) return;
    active = -1; body.classList.remove("cans-picked");
    names.forEach((n) => n.setAttribute("aria-pressed", "false"));
    cans.forEach((c) => { c.userData.liftTo = 0; c.userData.pullTo = 0; c.userData.dimTo = 0; });
    window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });
  }
  if (backBtn) backBtn.addEventListener("click", back);
  skipBtn.addEventListener("click", skip);

  // hover lifts a can; a click (not a drag) opens it; dragging turns both
  const ray = new THREE.Raycaster(), m = new THREE.Vector2(), turn = { a: 0, down: false, x: 0, moved: 0 };   // a: how far both cans are turned from facing front
  function hitCan(e) {
    const r = glCanvas.getBoundingClientRect(); m.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(m, camera); const h = ray.intersectObjects(cans, true)[0]; if (!h) return -1;
    let ob = h.object; while (ob && !cans.includes(ob)) ob = ob.parent; return cans.indexOf(ob);
  }
  glCanvas.addEventListener("pointerdown", (e) => { turn.down = true; turn.x = e.clientX; turn.moved = 0; glCanvas.setPointerCapture(e.pointerId); });
  glCanvas.addEventListener("pointerup", (e) => { turn.down = false; if (turn.moved < 6) { const k = hitCan(e); if (k >= 0) open(k); } });
  glCanvas.addEventListener("pointercancel", () => { turn.down = false; });
  glCanvas.addEventListener("pointermove", (e) => {
    if (turn.down) { const dx = e.clientX - turn.x; turn.x = e.clientX; turn.moved += Math.abs(dx); turn.a = Math.max(-.6, Math.min(.6, turn.a + dx * .008)); }
    if (busy || e.pointerType !== "mouse") return;
    const k = hitCan(e); glCanvas.style.cursor = k >= 0 ? "pointer" : "grab";
    cans.forEach((c, j) => c.userData.liftTo = j === k || j === active ? 1 : 0);
  });
  glCanvas.addEventListener("pointerleave", () => { if (!busy) cans.forEach((c, j) => c.userData.liftTo = j === active ? 1 : 0); });

  function resize() {
    const w = glCanvas.clientWidth, h = glCanvas.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.position.z = Math.max(140, 70 / (Math.tan(12 * Math.PI / 180) * camera.aspect));   // far enough back that both cans and the film tongue fit the width
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize);
  let last = performance.now(); const t0 = last;
  function frame(t) {
    if (!alive) return;
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    if (!turn.down) turn.a -= turn.a * (1 - Math.exp(-dt * 4));   // let go and they swing back to facing front
    floor.material.opacity = isDark() ? .45 : .22;
    // the name under each can follows it, at both sizes (main is drawn smaller on desktop, so undo that)
    const rr = root.getBoundingClientRect(), scale = rr.width / (root.offsetWidth || rr.width) || 1;
    cans.forEach((c, i) => {
      const u = c.userData, k = 1 - Math.exp(-dt * 9);
      u.lift += (u.liftTo - u.lift) * k; u.pull += (u.pullTo - u.pull) * k; u.dim += (u.dimTo - u.dim) * k;
      u.inner.rotation.y = turn.a + (still ? 0 : Math.sin((t - t0) / 2600) * .06);
      c.position.y = u.lift * 5;
      u.leader.position.set((Math.sin(PHI) - .17) * u.pull * 7, 0, (Math.cos(PHI) + .98) * u.pull * 7);
      c.scale.setScalar(1 - u.dim * .12);
      const p = toScreen(c.localToWorld(new THREE.Vector3(0, -2, 0)));
      names[i].style.left = (p.x - rr.left) / scale + "px"; names[i].style.top = (p.y - rr.top) / scale + 14 + "px";
    });
    if (!(pour && pour.covered())) renderer.render(scene, camera);   // no need to draw the cans while the film hides them
    raf = requestAnimationFrame(frame);
  }

  // every visit starts on the two cans
  resize();
  raf = requestAnimationFrame(frame);
  // get the pour ready while the visitor looks at the cans, so the click is instant
  const warm = () => { if (alive && !kit) kit = pourKit(rollPhotos()); };
  if (!still) (window.requestIdleCallback || setTimeout)(warm, { timeout: 1500 });

  return () => {
    alive = false; cancelAnimationFrame(raf); timers.forEach(clearTimeout);
    if (pour) { pour.done(true); pour = null; }
    if (kit) { kit.dispose(); kit = null; }
    removeEventListener("resize", resize);
    body.classList.remove("cans-picked", "cans-pouring");
    scene.traverse((o) => { if (o.geometry && o.geometry !== LID && o.geometry !== LEADER) o.geometry.dispose(); if (o.material) { o.material.map?.dispose(); o.material.alphaMap?.dispose(); o.material.roughnessMap?.dispose(); o.material.dispose(); } });
    pmrem.dispose(); renderer.dispose();
  };
}
