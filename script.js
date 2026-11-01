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

// How fast the film strip rolls: seconds for one frame to pass the middle. While a song is
// playing it rolls a little faster.
const FRAME_SECONDS = 3;
const FRAME_SECONDS_MUSIC = 2.4;

// Where the site's files live, from this script's own address. Photo addresses are built from it
// rather than being relative to the page, because during a page swap the address bar moves to the
// new page a moment before the home page's photo timer stops.
const SITE = new URL(".", (document.currentScript && document.currentScript.src) || location.href).href;

// Phones get the smaller files.
function photoUrl(name) {
  return SITE + "images/hero/" + name + (window.innerWidth < 700 ? "-700" : "") + ".webp";
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
// Drag it, or swipe it to fling it (it spins fast, then slows back to its normal roll); tap a frame
// to bring it to the middle; click anywhere else on the page to skip ahead. It slows right down
// while the mouse is on it, stops when the tab is hidden, and holds still for people who ask their
// device to reduce motion.
function startFilm(canvas) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FW = 600, PH = 400, EDGE = 58, H = PH + 2 * EDGE;   // one frame, in strip pixels
  const ctx = canvas.getContext("2d");

  // The order: the photos shuffled once, then the roll loops through them.
  const order = PHOTOS.slice();
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
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
      if (img) {
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
      f.fillText("LAD 400", FW - 110, 12);
      return c;
    };
    frames[k] = { col: make(), ready: !!img };
  }
  function need(k) {
    k = ((k % N) + N) % N;
    if (!frames[k]) paintFrame(k, null);         // plain film until the photo arrives
    if (frames[k].ready || loading.has(k)) return;
    loading.add(k);
    const img = new Image();
    img.onload = () => { paintFrame(k, img); loading.delete(k); };
    img.onerror = () => loading.delete(k);
    img.src = photoUrl(order[k]);
  }

  // Where the roll is, in frames (2.0 means frame 2 is in the middle), and how fast it's moving
  // (frames per second). A "seek" is a short eased move to a chosen frame (a tap or a click).
  let pos = 0, vel = 0, last = performance.now(), shown = 0;
  let seek = null;                                   // { from, to, start }
  let dragging = false, dragX = 0, dragPos = 0, moved = 0, hovering = false, samples = [];
  function playing() { return !!document.querySelector(".vinyl[aria-pressed='true'], .deck.playing"); }
  function cruise() {                                 // the speed it settles back to
    if (reduceMotion) return 0;
    return (hovering ? 0.2 : 1) / (playing() ? FRAME_SECONDS_MUSIC : FRAME_SECONDS);
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
    sf = phone ? Math.min(0.46, W / 850) : Math.min(0.95, W / 1550);   // strip scale on screen
  }
  resize();
  window.addEventListener("resize", resize);

  let raf = 0;
  const t0 = performance.now();
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
    if (Math.floor(pos + 0.5) !== shown) { shown = Math.floor(pos + 0.5); nextFont(); }   // the sign-off's font changes with each frame
    const t = reduceMotion ? 0 : (now - t0) / 1000;
    const cy = Hh * (phone ? 0.47 : 0.5), A = Hh * (phone ? 0.03 : 0.06);
    const k = Math.PI * 2 / (W * (phone ? 2.2 : 1.5)), ph = t * 0.35;
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
      const tw = Math.cos(x * k * 0.8 - ph * 1.3), sc = sf * (0.9 + 0.1 * tw);   // narrows as it turns away
      ctx.save();
      ctx.translate(x, y); ctx.rotate(ang); ctx.scale(1, sc);
      ctx.drawImage(fr.col, lx, 0, step / sf + 1, H, 0, -H / 2, step + 1, H);
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
  canvas.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") hovering = true; });
  canvas.addEventListener("pointerleave", () => { hovering = false; });
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
      const tapped = Math.floor(pos + 0.5 + (e.clientX - canvas.getBoundingClientRect().left - W / 2) / (FW * sf));
      if (tapped === Math.floor(pos + 0.5)) next(); else seekTo(tapped);
    }
    wake();
  });
  canvas.addEventListener("pointercancel", () => { dragging = false; vel = cruise(); });

  // Trackpad (two-finger swipe) and mouse wheel: the roll follows the swipe, including the
  // trackpad's own glide afterwards, then eases back to its normal roll. The home page doesn't
  // scroll, so up/down swipes move it too.
  let lastWheel = 0;
  function onWheel(e) {
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

  // Clicking anywhere else on the home page moves to the next frame (links and buttons excepted).
  function onClick(e) {
    if (e.target === canvas || e.target.closest("a, button")) return;
    if (String(window.getSelection())) return;
    next(); wake();
  }
  document.addEventListener("click", onClick);
  canvas.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") { e.preventDefault(); next(); wake(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); seekTo(Math.floor(pos + 0.5) - 1); wake(); }
  });

  return () => {
    cancelAnimationFrame(raf); raf = -1;
    window.removeEventListener("resize", resize);
    document.removeEventListener("click", onClick);
    document.removeEventListener("visibilitychange", onVisible);
  };
}

function initPage() {
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
    // On the home page each move of the film strip calls nextFont(), so they change together.
    // Pages without the photo run their own 2-second timer.
    if (!document.getElementById("film")) fontTimer = setInterval(nextFont, 1500);
  }
  const canvas = document.getElementById("film");
  if (canvas && PHOTOS.length > 1) stopHero = startFilm(canvas);

  // Projects page: the GitHub contribution graph, from data/github.json (refreshed nightly).
  // One square per day, a column per week, in the site's ink at five strengths (styles.css .l0-.l4).
  const gh = document.querySelector(".gh-graph");
  if (gh && !gh.dataset.done) {
    gh.dataset.done = "1";
    fetch(SITE + "data/github.json").then((r) => r.json()).then((d) => {
      if (!d.days || !d.days.length) return;
      const stat = gh.querySelector(".gh-stat");
      stat.insertBefore(document.createTextNode(d.total.toLocaleString() + " contributions in the last year · "), stat.firstChild);
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
      gh.insertBefore(months, stat);
      gh.insertBefore(grid, months);
    }).catch(() => {});
  }

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
