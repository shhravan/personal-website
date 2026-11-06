// The home page film strip.
// Each photo exists in images/hero/ in two sizes: NAME.webp (1200px wide, laptops and sharp screens)
// and NAME-700.webp (700px wide, phones). To add a photo, add both files and its name below.
const PHOTOS = [
  "natsamrat",
  "tram",
  "crowd",
  "garden-party",
  "vitthal",
  "shivaji",
  "wall-street",
  "classroom",
  "dwarka",
  "esplanade-dusk",
  "harvey-mike",
  "stone-cold",
  "oasis",
  "creation-of-adam",
  "rain",
  "basquiat",
  "partha-sarathi",
  "pcrc-beta",
  "queen",
  "shawshank",
  "shutter-island",
  "sisyphus",
  "the-choice",
  "znmd",
  "great-wave",
  "tumbbad",
  "cornell-1930",
];

// How each photo is framed in its film frame: [x, y, zoom].
//  x and y: the point of the photo to keep in view, as a percentage (50, 50 is the middle).
//  zoom: 1 shows the whole width; 1.3 zooms in 30% around that point.
const FOCUS = {
  "natsamrat": [50, 10, 1],
  "tram": [50, 58, 1],
  "crowd": [50, 45, 1],
  "garden-party": [50, 20, 1],
  "vitthal": [50, 40, 1],
  "shivaji": [45, 42, 1.2],
  "wall-street": [45, 65, 1.1],
  "classroom": [70, 68, 1.4],
  "dwarka": [50, 50, 1.22],
  "esplanade-dusk": [50, 55, 1],
  "harvey-mike": [50, 0, 1],
  "stone-cold": [50, 40, 1],
  "oasis": [50, 8, 1],
  "creation-of-adam": [45, 50, 1],
  "rain": [52, 60, 1.25],
  "basquiat": [50, 45, 1],
  "partha-sarathi": [45, 52, 1.15],
  "pcrc-beta": [50, 15, 1],
  "queen": [50, 20, 1],
  "shawshank": [50, 30, 1],
  "shutter-island": [50, 50, 1],
  "sisyphus": [50, 38, 1],
  "the-choice": [50, 35, 1.22],
  "znmd": [50, 20, 1],
  "great-wave": [50, 45, 1],
  "tumbbad": [50, 75, 1.3],
  "cornell-1930": [55, 35, 1],
};

// How long each hero photo stays (seconds). Set both the same for a steady pace.
const MIN_SECONDS = 1.5;
const MAX_SECONDS = 1.5;

// How fast the film strip rolls: seconds for one frame to pass the middle. While a song is
// playing it rolls a little faster.
const FRAME_SECONDS = 3;
const FRAME_SECONDS_MUSIC = 2.4;

// Where the site's files live, from this script's own address. Photo addresses are built from it
// rather than being relative to the page, because during a page swap the address bar moves to the
// new page a moment before the home page's photo timer stops.
const SITE = new URL(".", (document.currentScript && document.currentScript.src) || location.href).href;

// The film strip: phones get the smaller files.
function filmUrl(name) {
  return SITE + "images/hero/" + name + (window.innerWidth < 700 ? "-700" : "") + ".webp";
}

// Pick the smaller file when the frame is small enough (phones), the larger one otherwise.
function photoUrl(name) {
  const frame = document.querySelector(".hero");
  const pixels = (frame ? frame.clientWidth : 500) * (window.devicePixelRatio || 1);
  return SITE + "images/hero/" + name + (pixels <= 700 ? "-700" : "") + ".webp";
}

// Show a photo in the frame, using its framing from the FOCUS list.
function applyPhoto(img, name) {
  const [x, y, zoom] = FOCUS[name] || [50, 50, 1];
  img.style.objectPosition = x + "% " + y + "%";   // which part of the photo stays in view
  img.style.transformOrigin = x + "% " + y + "%";  // zoom in toward that same point
  img.style.transform = zoom > 1 ? "scale(" + zoom + ")" : "";
  img.src = photoUrl(name);
}

// The site swaps pages in place (theme.js) so the music keeps playing, which means this file
// runs once but pages come and go. initPage() sets up whatever page is showing, and stopHero
// shuts down the last page's photo timer and click listener first.
let stopHero = null;
let fontTimer = null;
let nextFont = () => {};   // changes "opticsbyshrvn" to the next font (set up in initPage)

// "opticsbyshrvn" in the last line changes font every 1.5 s, to make people curious enough to
// click it. The fonts are loaded in each page's <head>, only for these letters.
// Each entry: [family, style, weight]. The full list, with notes, is in docs/DESIGN.md.
const OPTICS_FONTS = [
  ["'Instrument Serif', serif", "italic", 400], ["'Gloock', serif", "normal", 400],
  ["'Bodoni Moda', serif", "italic", 400], ["'Italiana', serif", "normal", 400],
  ["'Young Serif', serif", "normal", 400], ["'Fraunces', serif", "italic", 300],
  ["'Unbounded', sans-serif", "normal", 300],
  ["'Jacquard 12', serif", "normal", 400],
  ["'Doto', monospace", "normal", 700], ["'Pixelify Sans', sans-serif", "normal", 400],
];

// ---- the film strip ----
// A roll of film drawn on a <canvas>: each frame is a photo with black film around it, sprocket
// holes along both edges and small gold frame numbers, like a real negative strip. The roll waves
// gently across the page and keeps rolling steadily, one frame every FRAME_SECONDS.
// It's drawn as many thin vertical slices, each placed and tilted along the wave, which is what
// makes the flat strip look bent. No libraries.
// It never stops on its own: only a click or tap on the strip itself stops it, and another starts it
// again. Drag it, or swipe it to fling it (it spins fast, then slows back to its normal roll). It
// pauses while the tab is hidden, and holds still for people who ask their device to reduce motion.
function startFilm(canvas) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FW = 600, PH = 400, EDGE = 58, H = PH + 2 * EDGE;   // one frame, in strip pixels
  const ctx = canvas.getContext("2d");
  const wave = parseFloat(canvas.dataset.wave || "1");   // how wavy: 1 is the full wave, smaller is calmer
  // Gallery strips (photography page): data-fit = frames across the width (the strip sizes its own
  // height), data-dir = -1 to roll the other way, data-label = the roll's name on the film edge,
  // data-leader = "title|small line" for a blank leader frame with the title before the photos.
  const fit = parseFloat(canvas.dataset.fit || "0"), dir = parseFloat(canvas.dataset.dir || "1");
  const label = canvas.dataset.label || "LAD 400";

  // The order: the roll's own photos if the page lists them (data-photos), otherwise every photo,
  // shuffled once. The roll loops through them.
  const order = canvas.dataset.photos ? canvas.dataset.photos.split(",") : PHOTOS.slice();
  if (!canvas.dataset.photos) for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (canvas.dataset.leader) order.unshift("__leader");
  const N = order.length, LEN = N * FW;

  // Each frame is painted once into its own small canvas as soon as its photo has downloaded. Photos load a few at a time, nearest first.
  const frames = order.map(() => null);
  const loading = new Set();
  function paintFrame(k, img) {
    const make = () => {
      const c = document.createElement("canvas");
      c.width = FW; c.height = H;
      const f = c.getContext("2d");
      const base = f.createLinearGradient(0, 0, 0, H);   // film base, a little lighter at the edges
      base.addColorStop(0, "#3a3834"); base.addColorStop(0.08, "#24221f");
      base.addColorStop(0.92, "#24221f"); base.addColorStop(1, "#3a3834");
      f.fillStyle = base; f.fillRect(0, 0, FW, H);
      if (order[k] === "__leader") {                              // the leader: the title, printed large
        const [title, sub] = canvas.dataset.leader.split("|");
        f.fillStyle = "#ece6d8"; f.font = "500 58px 'EB Garamond', Georgia, serif";
        f.fillText(title, 40, EDGE + PH / 2 + 10, FW - 80);
        if (sub) { f.font = "16px Silkscreen, monospace"; f.fillStyle = "rgba(236,230,216,.6)"; f.fillText(sub.toUpperCase(), 42, EDGE + PH / 2 + 56, FW - 80); }
      } else if (img) {
        const [fx, fy, zoom] = FOCUS[order[k]] || [50, 50, 1];
        const s = Math.max((FW - 12) / img.width, PH / img.height) * zoom;
        const w = img.width * s, h = img.height * s;
        const x = 6 + ((FW - 12) - w) * fx / 100, y = EDGE + (PH - h) * fy / 100;
        f.save();
        f.beginPath(); f.rect(6, EDGE, FW - 12, PH); f.clip();
        f.drawImage(img, x, y, w, h);
        f.restore();
      }
      f.fillStyle = "rgba(0,0,0,.35)"; f.fillRect(0, EDGE, 6, PH);   // the gap between frames
      f.fillStyle = "#ece6d8";                                       // sprocket holes
      for (let hx = 16; hx < FW - 20; hx += 40) {
        f.beginPath(); f.roundRect(hx, 16, 24, 27, 5); f.fill();
        f.beginPath(); f.roundRect(hx, H - 43, 24, 27, 5); f.fill();
      }
      f.font = "13px Silkscreen, monospace";
      f.fillStyle = "rgba(230,182,64,.9)";                           // frame numbers, like real film
      f.fillText(String(k + 1), 20, H - 4);
      f.fillText((k + 1) + "A", FW / 2 - 10, H - 4);
      f.font = "12px Silkscreen, monospace";
      f.fillStyle = "rgba(236,230,216,.45)";
      f.textAlign = "right"; f.fillText(label.toUpperCase(), FW - 20, 12); f.textAlign = "left";
      return c;
    };
    frames[k] = { col: make(), ready: !!img };
  }
  function need(k) {
    k = ((k % N) + N) % N;
    if (!frames[k]) paintFrame(k, null);         // plain film until the photo arrives
    if (frames[k].ready || loading.has(k) || order[k] === "__leader") return;
    loading.add(k);
    const img = new Image();
    img.onload = () => { paintFrame(k, img); loading.delete(k); };
    img.onerror = () => loading.delete(k);
    img.src = filmUrl(order[k]);
  }

  // Where the roll is, in frames (2.0 means frame 2 is in the middle), and how fast it's moving
  // (frames per second). A "seek" is a short eased move to a chosen frame (a tap or a click).
  let pos = 0, vel = 0, last = performance.now(), shown = 0;
  let seek = null;                                   // { from, to, start }
  let dragging = false, dragX = 0, dragPos = 0, moved = 0, paused = false, hover = false, samples = [], geo = null;
  function playing() { return !!document.querySelector(".vinyl[aria-pressed='true'], .deck.playing"); }
  function cruise() {                                 // the speed it settles back to
    if (reduceMotion) return 0;
    return paused || hover ? 0 : dir / (playing() ? FRAME_SECONDS_MUSIC : FRAME_SECONDS) / (fit ? 3 : 1);
  }
  function seekTo(target) { seek = { from: pos, to: target, start: performance.now() }; vel = cruise(); }
  function next() { seekTo(Math.floor(pos + 0.5) + 1); }

  let W = 0, Hh = 0, sf = 1, phone = false;
  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = canvas.clientWidth; Hh = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(Hh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    phone = W < 700;
    if (fit) {                                    // gallery strip: as many frames across as asked, and as tall as that makes it
      sf = W / ((phone ? Math.max(2, fit - 3) : fit) * FW);
      Hh = Math.ceil(H * sf) + 4;
      canvas.style.height = Hh + "px";
      canvas.height = Math.round(Hh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return;
    }
    sf = phone ? Math.min(0.46, W / 850) : Math.min(0.95, W / 1550, Hh / (canvas.dataset.wave ? 640 : 1250));   // strip scale; short windows get a smaller strip so it clears the links
  }
  resize();
  window.addEventListener("resize", resize);

  let raf = 0;
  let waveT = 0;
  function draw(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (seek) {
      const u = Math.min(1, (now - seek.start) / 600);
      pos = seek.from + (seek.to - seek.from) * (1 - Math.pow(1 - u, 3));   // ease out
      if (u >= 1) seek = null;
    } else if (!dragging) {
      vel = cruise() + (vel - cruise()) * Math.exp(-dt * 2.6);         // a fling slows back to the cruise
      pos += vel * dt;
    }
    if (Math.floor(pos + 0.5) !== shown) { shown = Math.floor(pos + 0.5); if (!fit) nextFont(); }   // the sign-off's font changes with each frame
    if (!reduceMotion && !paused) waveT += dt;                          // the wave freezes too when stopped
    const t = waveT;
    const cy = Hh * (phone ? 0.47 : 0.5), A = Hh * (phone ? 0.03 : 0.06) * wave;
    const k = Math.PI * 2 / (W * (phone ? 2.2 : 1.5)), ph = t * 0.35;
    geo = { cy, A, k, ph };
    const view = (W / 2) / sf;                                          // half the screen, in strip pixels
    const start = pos * FW + FW / 2 - view;                             // strip pixel at the left edge
    for (let f = Math.floor(start / FW) - 1; f <= Math.floor((start + 2 * view) / FW) + 2; f++) need(f);

    ctx.clearRect(0, 0, W, Hh);
    const step = phone ? 3 : 2;                                       // wider slices on phones: less work per frame
    for (let x = -30; x < W + 30; x += step) {
      const sx = start + x / sf, f = Math.floor(sx / FW), fr = frames[((f % N) + N) % N];
      if (!fr) continue;
      const lx = sx - f * FW;
      const y = cy + A * Math.sin(x * k + ph), ang = Math.atan(A * k * Math.cos(x * k + ph));
      const tw = wave ? Math.cos(x * k * 0.8 - ph * 1.3) : 1, sc = sf * (0.9 + 0.1 * tw);   // narrows as it turns away
      ctx.save();
      ctx.translate(x, y); ctx.rotate(ang); ctx.scale(1, sc);
      // A slice that runs past the end of a frame takes the rest from the next frame, so frames meet with no gap.
      const sw = step / sf + 1, a = Math.min(sw, FW - lx);
      ctx.drawImage(fr.col, lx, 0, a, H, 0, -H / 2, a * sf + .5, H);
      if (a < sw) { const nx = frames[(((f + 1) % N) + N) % N] || fr; ctx.drawImage(nx.col, 0, 0, sw - a, H, a * sf, -H / 2, (sw - a) * sf + .5, H); }
      const shade = 0.22 * (0.5 - 0.5 * tw);                          // light falls off where it turns
      if (!phone && shade > 0.01) { ctx.fillStyle = "rgba(0,0,0," + shade.toFixed(3) + ")"; ctx.fillRect(0, -H / 2, step + 1, H); }
      ctx.restore();
    }
    if (!document.hidden && (!reduceMotion || dragging || seek || Math.abs(vel) > 0.01)) raf = requestAnimationFrame(draw);
  }
  function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(draw); } }
  vel = cruise();
  wake();
  const onVisible = () => { if (!document.hidden) wake(); };
  document.addEventListener("visibilitychange", onVisible);

  // Pointer: drag to move the roll, let go mid-swipe to fling it; a tap (no drag) picks a frame.
  canvas.addEventListener("pointerdown", (e) => {
    dragging = true; seek = null; moved = 0; dragX = e.clientX; dragPos = pos;
    samples = [[performance.now(), pos]];
    canvas.setPointerCapture(e.pointerId); wake();
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    moved = Math.max(moved, Math.abs(e.clientX - dragX));
    pos = dragPos - (e.clientX - dragX) / (FW * sf);
    samples.push([performance.now(), pos]);
    if (samples.length > 6) samples.shift();
  });
  canvas.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;
    if (moved > 6) {                                   // a swipe: keep some of its speed, up to 4 frames a second
      const a = samples[0], b = samples[samples.length - 1], secs = (b[0] - a[0]) / 1000;
      const v = secs > 0 && performance.now() - b[0] < 120 ? (b[1] - a[1]) / secs * 0.6 : 0;
      vel = Math.max(-4, Math.min(4, v));
    } else {
      // A tap on a frame tells the page which photo it was (the photography page opens it large).
      // Taps on the empty page around the strip do nothing.
      const r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (geo && Math.abs(y - (geo.cy + geo.A * Math.sin(x * geo.k + geo.ph))) < (H / 2) * sf) {
        const f = Math.floor(pos + 0.5 + (x - W / 2) / (FW * sf));
        if (order[((f % N) + N) % N] === "__leader") return;
        paused = true; vel = 0;   // the roll stops while the photo is open; "framedone" starts it again
        canvas.dispatchEvent(new CustomEvent("frametap", { detail: order[((f % N) + N) % N] }));
      }
    }
    wake();
  });
  canvas.addEventListener("pointercancel", () => { dragging = false; vel = cruise(); });
  canvas.addEventListener("framedone", () => { paused = false; vel = cruise(); wake(); });
  if (fit) {                                       // gallery strips stop while the mouse is on them
    canvas.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { hover = true; vel = 0; } });
    canvas.addEventListener("pointerleave", () => { hover = false; vel = cruise(); wake(); });
  }

  // Trackpad (two-finger swipe) and mouse wheel: the roll follows the swipe, including the
  // trackpad's own glide afterwards, then eases back to its normal roll. The home page doesn't
  // scroll, so up/down swipes move it too.
  let lastWheel = 0;
  function onWheel(e) {
    if (fit && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) return;   // gallery strips: up/down scrolls the page as usual
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const px = e.deltaMode === 1 ? d * 16 : d;                         // lines to pixels
    const step = px / (FW * sf);
    const now = performance.now(), secs = Math.max(0.008, (now - lastWheel) / 1000);
    lastWheel = now;
    e.preventDefault();
    seek = null;
    pos += step;
    vel = Math.max(-4, Math.min(4, secs < 0.1 ? step / secs : cruise()));
    wake();
  }
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.style.touchAction = "pan-y";   // vertical swipes still scroll the page

  canvas.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") { e.preventDefault(); next(); wake(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); seekTo(Math.floor(pos + 0.5) - 1); wake(); }
  });

  return () => {
    cancelAnimationFrame(raf); raf = -1;
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVisible);
  };
}

// ---- the opening sequence (home page, first visit in a session) ----
// The site opens on a burst of the hero photos, full screen, changing faster and faster; then the
// last one shrinks down into the hero frame and the rest of the page fades in. About 4 seconds.
// "skip" (bottom right) ends it straight away. It plays once per visit, and never for people who
// ask their device to reduce motion.
// ms each photo shows: 20 photos, each a little quicker than the last (about 3 s), then the
// settle; about 4 seconds before the page appears.
const INTRO_STEPS = [230, 219, 208, 198, 189, 180, 171, 163, 155, 147, 140, 134, 127, 121, 115, 110, 104, 99, 95, 90];
function playIntro(heroImg) {
  const root = document.documentElement;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  root.classList.add("intro-on");
  const stage = document.createElement("div");
  stage.className = "intro-stage";
  const pic = document.createElement("img");
  pic.alt = "";
  const skip = document.createElement("button");
  skip.type = "button";
  skip.className = "intro-skip";
  skip.textContent = "skip";
  stage.append(pic, skip);
  document.body.appendChild(stage);

  // The photos for the burst, shuffled; each is downloaded first so nothing flashes blank.
  const names = PHOTOS.slice().sort(() => Math.random() - 0.5).slice(0, INTRO_STEPS.length);
  const ready = names.map((n) => new Promise((ok) => {
    const im = new Image(); im.onload = () => ok(im.src); im.onerror = () => ok(null); im.src = photoUrl(n);
  }));
  let done = false, timer = 0;
  function finish(fast) {
    if (done) return;
    done = true;
    clearTimeout(timer);
    if (fast) { stage.remove(); root.classList.remove("intro-on"); return; }
    // Shrink the full-screen photo onto the hero frame, then hand over to the real hero.
    pic.src = heroImg.src;
    const to = heroImg.parentElement.getBoundingClientRect();
    const sx = to.width / innerWidth, sy = to.height / innerHeight;
    stage.classList.add("settling");
    pic.style.transformOrigin = "0 0";
    pic.style.transform = "translate(" + to.left + "px," + to.top + "px) scale(" + sx + "," + sy + ")";
    setTimeout(() => {
      root.classList.remove("intro-on");
      stage.classList.add("gone");
      setTimeout(() => stage.remove(), 500);
    }, 750);
  }
  skip.addEventListener("click", () => finish(true));
  // Start as soon as the first photo is in; each step shows the next photo that has arrived.
  const loaded = [];
  ready.forEach((r) => r.then((src) => { if (src) loaded.push(src); }));
  // Timed by the clock, not by counting timers, so a slow device skips photos instead of running long.
  const ends = INTRO_STEPS.map((_, k) => INTRO_STEPS.slice(0, k + 1).reduce((x, y) => x + y, 0));
  ready[0].then(() => {
    const t0 = performance.now();
    let shown = -1;
    (function tick() {
      if (done) return;
      const t = performance.now() - t0;
      if (t >= ends[ends.length - 1]) return finish(false);
      const k = ends.findIndex((e) => t < e);
      if (k !== shown && loaded.length) { shown = k; pic.src = loaded[k % loaded.length]; }
      requestAnimationFrame(tick);
    })();
  });
}

// ---- the photography page ----
// Film Gallery and Commercial are two tabs. Each roll (or project) is a straight film strip that
// drifts sideways, alternate strips the other way. A photo tapped on a strip (or chosen from the
// strip's list of buttons, for keyboards) opens large in a <dialog> over a darkened page and stops
// that strip; ← back, Esc or the backdrop closes it, the arrows move through that roll.
function startPhotography() {
  const tabs = [...document.querySelectorAll(".photo-tabs button")];
  const panes = [...document.querySelectorAll(".photo-pane")];
  const box = document.querySelector(".lightbox"), big = box.querySelector("img"), cap = box.querySelector(".lb-cap");
  // The page column is drawn at 80% on desktop (zoom), which shrank and shifted the photo card off centre.
  // Living directly in <body> keeps it at full size and centred.
  document.body.appendChild(box);
  const stops = [];
  let frames = [], at = 0, strip = null;
  function show(k) {
    at = (k + frames.length) % frames.length;
    const d = frames[at].dataset;
    big.src = filmUrl(d.name).replace("-700.webp", ".webp");
    big.alt = d.caption;
    cap.innerHTML = "";
    const left = document.createElement("div"), right = document.createElement("div");
    left.innerHTML = '<span class="lb-title"></span><span class="lb-place"></span>';
    left.querySelector(".lb-title").textContent = d.caption;
    left.querySelector(".lb-place").textContent = [d.place, d.year].filter(Boolean).join(" · ");
    right.className = "lb-meta";
    right.textContent = "frame " + String(at + 1).padStart(2, "0") + " / " + String(frames.length).padStart(2, "0");
    if (d.film) { right.appendChild(document.createElement("br")); right.appendChild(document.createTextNode(d.film)); }
    cap.append(left, right);
  }
  function open(roll, name) {
    frames = [...roll.querySelectorAll(".roll-list button")];
    strip = roll.querySelector("canvas");
    const k = frames.findIndex((f) => f.dataset.name === name);
    if (k < 0) return;
    show(k);
    if (!box.open) box.showModal();
  }
  document.querySelectorAll(".roll").forEach((roll, i) => {
    const canvas = roll.querySelector("canvas");
    canvas.dataset.photos = [...roll.querySelectorAll(".roll-list button")].map((b) => b.dataset.name).join(",");
    if (i % 2) canvas.dataset.dir = "-1";
    canvas.addEventListener("frametap", (e) => open(roll, e.detail));
    roll.querySelector(".roll-list").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) open(roll, b.dataset.name); });
    stops.push(startFilm(canvas));
  });
  tabs.forEach((t, i) => t.addEventListener("click", () => {
    tabs.forEach((x, k) => x.setAttribute("aria-selected", k === i ? "true" : "false"));
    panes.forEach((p, k) => { p.hidden = k !== i; });
    window.dispatchEvent(new Event("resize"));   // strips in a pane that was hidden need their size
  }));
  box.querySelector(".lb-back").addEventListener("click", () => box.close());
  box.addEventListener("close", () => { if (strip) strip.dispatchEvent(new Event("framedone")); });
  box.querySelector(".lb-prev").addEventListener("click", () => show(at - 1));
  box.querySelector(".lb-next").addEventListener("click", () => show(at + 1));
  box.addEventListener("click", (e) => { if (e.target === box) box.close(); });
  box.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(at - 1);
    if (e.key === "ArrowRight") show(at + 1);
  });
  // The two film cans (photography/cans.js, with three.js) are loaded only here, and only if the
  // browser can draw 3D; otherwise the page just shows the tabs and strips as before.
  let stopCans = null, gone = false;
  const cansRoot = document.querySelector(".cans");
  if (cansRoot && window.WebGLRenderingContext) {
    import(SITE + "photography/cans.js?v=11").then((m) => m.ready().then(() => {
      if (!gone) stopCans = m.start(cansRoot, tabs);
    })).catch(() => document.body.classList.add("cans-off"));
  } else document.body.classList.add("cans-off");
  return () => { gone = true; if (stopCans) stopCans(); stops.forEach((f) => f()); if (box.open) box.close(); box.remove(); };
}

function initPage(e) {
  const fresh = !e;   // a real page load (or reload); page swaps from the top links pass the page:load event
  if (stopHero) { stopHero(); stopHero = null; }
  clearInterval(fontTimer);
  nextFont = () => {};
  const optics = document.querySelector(".foot em");
  if (optics && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Same idea as the photos: shuffle the fonts like a deck and deal them out, so every font
    // shows once before any repeats, and a new deck never starts with the font just shown.
    let fontDeck = [], lastFont = -1;
    nextFont = () => {
      if (fontDeck.length === 0) {
        fontDeck = OPTICS_FONTS.map((_, i) => i);
        for (let i = fontDeck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [fontDeck[i], fontDeck[j]] = [fontDeck[j], fontDeck[i]];
        }
        if (fontDeck[0] === lastFont) fontDeck.push(fontDeck.shift());
      }
      lastFont = fontDeck.shift();
      [optics.style.fontFamily, optics.style.fontStyle, optics.style.fontWeight] = OPTICS_FONTS[lastFont];
    };
    // On home the photo rotation calls nextFont(), so the two change together; other pages run their own timer.
    if (!document.getElementById("hero-img")) fontTimer = setInterval(nextFont, 1500);
  }
  if (document.querySelector(".photo-pane")) stopHero = startPhotography();
  const img = document.getElementById("hero-img");

  if (img && PHOTOS.length > 1) {
    // Respect people who ask their device to reduce motion: no automatic rotating.
    // (Clicking still changes the photo, because that is the visitor's own choice.)
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- random, with no repeats until every photo has shown ----
    // Shuffle the whole list like a deck of cards and deal it out. Only when the deck runs out
    // is it reshuffled, so every photo appears once before any photo appears twice. The new
    // deck is checked so its first photo is never the one that just showed.
    function shuffle(list) {
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];   // swap two items
      }
      return list;
    }

    let deck = shuffle(PHOTOS.slice());
    let current = deck.shift();       // the photo showing now
    applyPhoto(img, current);

    function nextName() {
      if (deck.length === 0) {
        deck = shuffle(PHOTOS.slice());
        if (deck[0] === current) deck.push(deck.shift());   // no repeat across the reshuffle
      }
      return deck.shift();
    }

    // Quietly download the next two photos so each swap is instant.
    function preloadAhead() {
      if (deck.length < 2) return;   // they are fetched as soon as the new deck exists
      deck.slice(0, 2).forEach((name) => { new Image().src = photoUrl(name); });
    }
    preloadAhead();

    // Show the next photo. We load it first, so the swap is instant and never blank.
    function showNext() {
      const next = nextName();
      const loader = new Image();
      loader.onload = () => {
        applyPhoto(img, next);   // instant swap, no fade
      nextFont();              // the font under the page changes at the same moment
        current = next;
        preloadAhead();
      };
      loader.onerror = () => {};  // if one photo fails to load, just skip it
      loader.src = photoUrl(next);
    }

    // The automatic timer: each wait is a fresh random length between MIN and MAX.
    let timer = null;
    function startTimer() {
      if (reduceMotion) return;
      clearTimeout(timer);
      const wait = (MIN_SECONDS + Math.random() * (MAX_SECONDS - MIN_SECONDS)) * 1000;
      timer = setTimeout(() => { showNext(); startTimer(); }, wait);
    }
    startTimer();

    // Jump to the next photo now, and start a new countdown.
    function skip() {
      showNext();
      startTimer();
    }

    // Clicking or tapping anywhere on the home page changes the photo (field.js also sends a
    // ripple from the same click). Links, buttons and selecting text are left alone.
    function onClick(e) {
      if (e.target.closest("a, button")) return;
      if (String(window.getSelection())) return;
      skip();
    }
    document.addEventListener("click", onClick);

    // Keyboard: Enter or Space while the photo is focused.
    const hero = img.parentElement;
    hero.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();   // stop Space from scrolling the page
        skip();
      }
    });

    stopHero = () => { clearTimeout(timer); document.removeEventListener("click", onClick); };
  }
  // the opening burst plays whenever the site is loaded or reloaded on home, not when you click back to home
  if (img && fresh && document.querySelector("main.hero-home")) playIntro(img);

  // Projects page: the GitHub contribution graph, from data/github.json (refreshed nightly).
  // One square per day, a column per week, in the site's ink at five strengths (styles.css .l0-.l4).
  const gh = document.querySelector(".gh-graph");
  if (gh && !gh.dataset.done) {
    gh.dataset.done = "1";
    fetch(SITE + "data/github.json").then((r) => r.json()).then((d) => {
      if (!d.days || !d.days.length) return;
      const stat = gh.querySelector(".gh-stat");
      stat.insertBefore(document.createTextNode(d.total.toLocaleString() + " contributions in the last year"), stat.firstChild);
      const grid = document.createElement("div");
      grid.className = "gh-days";
      grid.setAttribute("role", "img");
      grid.setAttribute("aria-label", d.total + " GitHub contributions in the last year");
      const first = new Date(d.days[0][0] + "T00:00:00").getDay();   // pad so each column starts on Sunday
      for (let i = 0; i < first; i++) grid.appendChild(document.createElement("i"));
      d.days.forEach(([date, n, level]) => {
        const c = document.createElement("i");
        c.className = "l" + level;
        c.title = (n === 1 ? "1 contribution" : n + " contributions") + " on " + date;
        grid.appendChild(c);
      });
      const months = document.createElement("div");
      months.className = "gh-months";
      const start = new Date(d.days[0][0] + "T00:00:00");
      for (let m = 0; m < 12; m++) {
        const s = document.createElement("span");
        s.textContent = new Date(start.getFullYear(), start.getMonth() + m + 1, 1).toLocaleString("en", { month: "short" }).toLowerCase();
        months.appendChild(s);
      }
      gh.append(grid, months);
    }).catch(() => {});
  }

  // Blog: notes and essays come from two scripts; show them as one list, newest first.
  const entries = document.querySelector(".entries");
  if (entries) [...entries.querySelectorAll("li[data-date]")].sort((a, b) => b.dataset.date.localeCompare(a.dataset.date)).forEach((li) => entries.appendChild(li));

  // Turn each email into a real clickable mailto: link.
  // The address is stored in two pieces in the HTML (data-user and data-domain) so simple
  // bots reading the page text don't find a complete address.
  document.querySelectorAll("a.email").forEach((a) => {
    a.href = "mailto:" + a.dataset.user + "@" + a.dataset.domain;
    a.textContent = a.dataset.user + "@" + a.dataset.domain;   // show the real address once joined
  });
}

initPage();
document.addEventListener("page:load", initPage);   // sent by theme.js after each page swap
