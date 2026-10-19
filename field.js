// The faint field of letters behind the home page.
//
// What you see: a grid of small letters covering the whole window, very faint. A few letters
// twinkle (scramble for a moment). Near the cursor the letters dissolve in a grainy circle.
// A click sends a ripple outward: letters on the wave brighten and scramble, then settle.
//
// How it works: WebGL lets the graphics card draw every letter of the grid in a single pass, so
// thousands of letters stay smooth. All the letter shapes are drawn once into a small image
// (the "atlas"); each cell of the grid shows one tile of that image. The small program below
// (a "shader") decides, for every cell, which letter to show and how strong it is.
//
// Idea inspired by contentarchitecture.dev; this code is written from scratch for this site.
(function () {
  // No field for people who ask for less motion, or browsers without WebGL 2: the page simply
  // looks as it did before.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var canvas = document.createElement("canvas");
  var gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return;

  // ---- settings (sizes in CSS pixels) ----
  var CELL_W = 7;            // width of one letter cell (small, so the painting has enough detail)
  var CELL_H = 12;           // height of one letter cell
  var HOVER_RADIUS = 120;    // size of the dissolving circle around the cursor
  var RIPPLE_WIDTH = 110;    // thickness of the ripple's wave
  var RIPPLE_SECONDS = 1.8;  // how long a ripple lasts
  var MAX_RIPPLES = 8;       // ripples that can overlap at once

  // Placeholder text: random lowercase "words". Shravan will supply real words later.
  // GLYPHS are all the characters the field can show (index 0 is a space).
  // Letters come from two scripts, English (Latin) and Devanagari, mixed at random.
  var LATIN = "abcdefghijklmnopqrstuvwxyz";
  var DEVANAGARI = "अआइउएओकखगघचछजझटठडढतथदधनपफबभमयरलवशसह";
  var GLYPHS = " ·" + LATIN + DEVANAGARI;
  function placeholderText() {
    var out = "";
    while (out.length < 700) {
      var letters = Math.random() < 0.5 ? LATIN : DEVANAGARI;   // each word is one script or the other
      var len = 2 + Math.floor(Math.random() * 6);
      for (var i = 0; i < len; i++) out += letters[Math.floor(Math.random() * letters.length)];
      out += Math.random() < 0.12 ? " · " : " ";
    }
    return out;
  }

  // ---- the shader programs ----
  var VERTEX = [
    "#version 300 es",
    "precision highp float;",
    "in vec2 aCorner;                 // corner of a cell: (0,0) top-left to (1,1) bottom-right",
    "uniform vec2 uGrid;              // columns, rows",
    "uniform vec2 uAtlasGrid;         // atlas columns, rows",
    "uniform float uAspect;           // cell height / cell width, to keep circles round",
    "uniform float uTime;",
    "uniform sampler2D uText;         // the placeholder text, one letter per pixel",
    "uniform float uTextLen;",
    "uniform vec2 uMouse;             // cursor, in cells",
    "uniform float uHover;            // 0 when the cursor is away, 1 when it is over the page",
    "uniform float uRadius;           // hover circle size, in cells",
    "uniform float uRippleStart[" + MAX_RIPPLES + "];",
    "uniform vec2 uRippleCenter[" + MAX_RIPPLES + "];",
    "uniform float uRippleCount;",
    "uniform float uRippleMax;        // how far a ripple travels, in cells",
    "uniform float uRippleWidth;      // wave thickness, in cells",
    "uniform float uBase;             // normal letter strength (very faint)",
    "uniform float uBright;           // strength of letters on a ripple's wave",
    "uniform sampler2D uSea;          // the Great Wave, cut out (transparent sky)",
    "uniform vec3 uSeaH;              // its height, width and left edge on screen, in cells",
    "uniform float uDark;             // 1 in dark mode",
    "uniform vec3 uColor;             // normal letter color (the text color)",
    "uniform vec4 uQuiet;             // the content column (x0, y0, x1, y1 in cells): letters are fainter there",
    "out vec2 vUv;",
    "out float vAlpha;",
    "out vec3 vColor;",
    "out vec4 vTile;                  // a colored tile behind the letter (inside the painting only)",
    "",
    "float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",
    "float hash1(float x) { return fract(sin(x * 12.9898) * 43758.5453); }",
    "float dist(vec2 d) { d.y *= uAspect; return length(d); }",
    "float randomLetter(float seed, float count) { return 1.0 + floor(hash1(seed) * (count - 1.0)); }",
    "",
    "void main() {",
    "  int cols = int(uGrid.x);",
    "  vec2 cell = vec2(float(gl_InstanceID % cols), float(gl_InstanceID / cols));",
    "  float r = hash(cell);          // a fixed random number for this cell",
    "  float count = uAtlasGrid.x * uAtlasGrid.y;",
    "",
    "  // Which letter: read along the text, each row starting at a random place.",
    "  float rowStart = floor(hash1(cell.y + 0.5) * uTextLen);",
    "  float letter = floor(texelFetch(uText, ivec2(int(mod(cell.x + rowStart, uTextLen)), 0), 0).r * 255.0 + 0.5);",
    "",
    "  // Twinkle: each cell has its own slow clock; now and then it scrambles for a moment.",
    "  float twinkle = step(0.985, sin(uTime * 0.25 + r * 6.2832) * 0.5 + 0.5);",
    "  letter = mix(letter, randomLetter(r * 17.13 + floor(uTime * 3.0), count), twinkle);",
    "",
    "  // Ripples: a ring that grows from each click; strongest on the ring, fading in and out.",
    "  float wave = 0.0;",
    "  for (int i = 0; i < " + MAX_RIPPLES + "; i++) {",
    "    if (float(i) >= uRippleCount) break;",
    "    float t = (uTime - uRippleStart[i]) / " + RIPPLE_SECONDS.toFixed(2) + ";",
    "    if (t < 0.0 || t >= 1.0) continue;",
    "    float radius = smoothstep(0.0, 1.0, t) * uRippleMax;",
    "    float d = dist(cell - uRippleCenter[i]);",
    "    float ring = 1.0 - smoothstep(0.0, uRippleWidth * 0.5, abs(d - radius));",
    "    wave = max(wave, ring * smoothstep(0.0, 0.2, t) * (1.0 - smoothstep(0.75, 1.0, t)));",
    "  }",
    "  // About half the cells on the wave light up and scramble fast.",
    "  float lit = step(r, wave * 0.55) * step(0.001, wave);",
    "  letter = mix(letter, randomLetter(r * 7.13 + floor(uTime * 24.0), count), lit);",
    "",
    "  // Hover: letters near the cursor fade, and some switch off entirely, giving a grainy edge.",
    "  float near = (1.0 - smoothstep(0.0, uRadius, dist(cell - uMouse))) * uHover;",
    "  float off = step(r, near * 2.5) * step(0.001, near);",
    "",
    "  // Quieter behind the writing so the text stays easy to read; soft edges, no hard box.",
    "  vec2 outside = max(uQuiet.xy - cell, cell - uQuiet.zw);",
    "  float quiet = 1.0 - smoothstep(-1.0, 6.0, max(outside.x, outside.y));",
    "  // Outside the painting: the plain faint field, quieter behind the writing.",
    "  float alpha = uBase * (1.0 + 1.5 * twinkle) * (1.0 - 0.65 * quiet);",
    "  vec3 tint = uColor;",
    "  vec4 tile = vec4(0.0);",
    "",
    "  // The Great Wave (Hokusai), cut out of its sky, stretched across the bottom of the window",
    "  // and rebuilt from tiles. Slow sine motion sways the picture so the water swells and rolls.",
    "  vec2 m = vec2((cell.x - uSeaH.z) / uSeaH.y, (cell.y - (uGrid.y - uSeaH.x)) / uSeaH.x);",
    "  m.x = 1.0 - abs(mod(m.x + 1.0, 2.0) - 1.0);   // mirror-repeat sideways",
    "  if (m.y >= 0.0 && m.y < 1.0) {",
    "    m.x += 0.006 * sin(m.y * 8.0 + uTime * 0.6) + 0.003 * sin(m.y * 21.0 - uTime * 1.1);",
    "    m.y += 0.012 * sin(m.x * 6.0 + uTime * 0.7) + 0.004 * sin(m.x * 17.0 + uTime * 1.3);",
    "    vec4 sea = texture(uSea, clamp(m, 0.001, 0.999));",
    "    if (sea.a > 0.5) {",
    "      float behind = 1.0 - 0.6 * quiet;",
    "      tile = vec4(sea.rgb, 0.9 * behind * (1.0 - near) * (1.0 - off));",
    "      tint = uDark > 0.5 ? mix(sea.rgb, vec3(1.0), 0.55) : mix(sea.rgb, vec3(0.0), 0.6);",
    "      alpha = 0.9 * behind * (1.0 + 0.3 * twinkle);",
    "    }",
    "  }",
    "  vColor = tint;",
    "  vTile = tile;",
    "  alpha *= 1.0 - near;",
    "  alpha = mix(alpha, 0.0, off);",
    "  alpha = mix(alpha, uBright, lit);",
    "  vAlpha = alpha;",
    "",
    "  // Find this letter's tile in the atlas.",
    "  float tileCol = mod(letter, uAtlasGrid.x);",
    "  float tileRow = floor(letter / uAtlasGrid.x);",
    "  vUv = vec2((tileCol + aCorner.x) / uAtlasGrid.x, (tileRow + aCorner.y) / uAtlasGrid.y);",
    "",
    "  // Place the cell on screen (WebGL measures the screen from -1 to 1, with y pointing up).",
    "  vec2 pos = -1.0 + (cell + aCorner) * (2.0 / uGrid);",
    "  gl_Position = vec4(pos.x, -pos.y, 0.0, 1.0);",
    "}"
  ].join("\n");

  var FRAGMENT = [
    "#version 300 es",
    "precision mediump float;",
    "uniform sampler2D uAtlas;",
    "in vec3 vColor;",
    "in vec4 vTile;",
    "in vec2 vUv;",
    "in float vAlpha;",
    "out vec4 color;",
    "void main() {",
    "  float a = texture(uAtlas, vUv).a * vAlpha;          // the letter",
    "  float t = vTile.a * (1.0 - a);                       // the tile shows around the letter",
    "  color = vec4(vColor * a + vTile.rgb * t, a + t);     // colors pre-multiplied by opacity",
    "}"
  ].join("\n");

  function compile(type, source) {
    var s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  var vs = compile(gl.VERTEX_SHADER, VERTEX), fs = compile(gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vs || !fs) return;
  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(prog)); return; }
  gl.useProgram(prog);
  var U = {};
  ["uGrid", "uAtlasGrid", "uAspect", "uTime", "uText", "uTextLen", "uMouse", "uHover", "uRadius",
   "uRippleStart", "uRippleCenter", "uRippleCount", "uRippleMax", "uRippleWidth", "uBase", "uBright",
   "uAtlas", "uColor", "uQuiet", "uDark", "uSea", "uSeaH"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

  // One cell = two triangles. Every cell reuses this shape; the shader moves it into place.
  var quad = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, "aCorner");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  gl.enable(gl.BLEND);
  // Colors are "pre-multiplied" (already scaled by opacity), which is what the browser expects
  // when it lays the canvas over the page; this blend mode matches that.
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  // ---- the text, stored as a 1-pixel-tall image (one letter index per pixel) ----
  var text = placeholderText();
  var codes = new Uint8Array(text.length);
  for (var i = 0; i < text.length; i++) codes[i] = Math.max(0, GLYPHS.indexOf(text[i]));
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, codes.length, 1, 0, gl.RED, gl.UNSIGNED_BYTE, codes);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.uniform1i(U.uText, 1);
  gl.uniform1f(U.uTextLen, codes.length);

  // ---- the Great Wave picture, loaded once; it spans the window width, anchored to the bottom ----
  var seaAspect = 640 / 442;
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  gl.uniform1i(U.uSea, 2);
  var seaImg = new Image();
  seaImg.onload = function () {
    seaAspect = seaImg.width / seaImg.height;
    gl.activeTexture(gl.TEXTURE2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, seaImg);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    fitSea(); draw();
  };
  seaImg.src = "images/field/great-wave.png";
  // The picture fills the bottom half of the window at its natural shape; beyond its right edge
  // it repeats as a mirror image, so the sea always spans the full width.
  function fitSea() {
    var h = window.innerHeight * 0.5, w = h * seaAspect;
    // The mirror seam sits at the window's center, so the two curls land in the side margins.
    gl.uniform3f(U.uSeaH, h / CELL_H, w / CELL_W, (window.innerWidth / 2 - w) / CELL_W);
  }

  // ---- the atlas: every glyph drawn once, in EB Garamond, onto a small canvas ----
  var ATLAS_COLS = 8, ATLAS_ROWS = Math.ceil(GLYPHS.length / 8), TILE_W = 36, TILE_H = 60;
  var atlasTex = gl.createTexture();
  function buildAtlas() {
    var c = document.createElement("canvas");
    c.width = ATLAS_COLS * TILE_W;
    c.height = ATLAS_ROWS * TILE_H;
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "46px 'EB Garamond', 'Noto Serif Devanagari', Georgia, serif";
    for (var g = 0; g < GLYPHS.length; g++) {
      ctx.fillText(GLYPHS[g], (g % ATLAS_COLS + 0.5) * TILE_W, (Math.floor(g / ATLAS_COLS) + 0.55) * TILE_H);
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, atlasTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(U.uAtlas, 0);
    gl.uniform2f(U.uAtlasGrid, ATLAS_COLS, ATLAS_ROWS);
  }
  buildAtlas();
  if (document.fonts) document.fonts.ready.then(function () { buildAtlas(); draw(); });

  // ---- colors follow the light/dark theme ----
  function applyTheme() {
    var styles = getComputedStyle(document.documentElement);
    var hex = (styles.getPropertyValue("--ink") || "#1a1a1a").trim().replace("#", "");
    if (hex.length === 3) hex = hex.replace(/./g, "$&$&");
    var n = parseInt(hex, 16);
    gl.uniform3f(U.uColor, (n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255);
    var dark = document.documentElement.getAttribute("data-theme") === "dark" ||
      (!document.documentElement.getAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    gl.uniform1f(U.uBase, dark ? 0.16 : 0.14);
    gl.uniform1f(U.uBright, dark ? 0.8 : 0.7);
    gl.uniform1f(U.uDark, dark ? 1 : 0);
  }
  new MutationObserver(function () { applyTheme(); draw(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { applyTheme(); draw(); });

  // ---- size: the canvas covers the window, behind everything ----
  canvas.className = "field";
  canvas.setAttribute("aria-hidden", "true");
  var cols = 1, rows = 1;
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth, h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    cols = Math.ceil(w / CELL_W);
    rows = Math.ceil(h / CELL_H);
    // The grid is a whole number of cells, so it is drawn slightly larger than the window.
    canvas.style.width = cols * CELL_W + "px";
    canvas.style.height = rows * CELL_H + "px";
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.uGrid, cols, rows);
    gl.uniform1f(U.uAspect, CELL_H / CELL_W);
    gl.uniform1f(U.uRadius, HOVER_RADIUS / CELL_W);
    gl.uniform1f(U.uRippleMax, Math.max(w, h) * 0.75 / CELL_W);
    gl.uniform1f(U.uRippleWidth, RIPPLE_WIDTH / CELL_W);
    fitSea();
  }

  // The content column, in cells, padded a little. Updated on resize and scroll.
  function updateQuiet() {
    var main = document.querySelector("main");
    if (!main) return;
    var r = main.getBoundingClientRect();
    gl.uniform4f(U.uQuiet, (r.left - 12) / CELL_W, (r.top - 12) / CELL_H, (r.right + 12) / CELL_W, (r.bottom + 12) / CELL_H);
  }
  window.addEventListener("scroll", function () { updateQuiet(); draw(); }, { passive: true });

  // ---- cursor and clicks ----
  var mouse = { x: -999, y: -999 }, target = { x: -999, y: -999 }, hover = 0, hoverTarget = 0;
  var ripples = [];   // { start, x, y } in seconds and cells
  function toCells(e) { return { x: e.clientX / CELL_W, y: e.clientY / CELL_H }; }
  window.addEventListener("pointermove", function (e) {
    target = toCells(e);
    if (hoverTarget === 0) { mouse.x = target.x; mouse.y = target.y; }   // appear at the cursor, not glide in
    hoverTarget = 1;
    wake();
  });
  document.documentElement.addEventListener("pointerleave", function () { hoverTarget = 0; wake(); });
  window.addEventListener("blur", function () { hoverTarget = 0; });
  // Same rule as the photo change: a click anywhere except links and buttons.
  document.addEventListener("click", function (e) {
    if (e.target.closest("a, button")) return;
    var c = toCells(e);
    ripples.push({ start: now, x: c.x, y: c.y });
    if (ripples.length > MAX_RIPPLES) ripples.shift();
    wake();
  });

  // ---- the animation loop ----
  var now = 0, last = performance.now(), frame = 0, lastDraw = 0;
  var starts = new Float32Array(MAX_RIPPLES), centers = new Float32Array(MAX_RIPPLES * 2);
  function draw() {
    gl.uniform1f(U.uTime, now);
    gl.uniform2f(U.uMouse, mouse.x, mouse.y);
    gl.uniform1f(U.uHover, hover);
    for (var i = 0; i < MAX_RIPPLES; i++) {
      var r = ripples[i];
      starts[i] = r ? r.start : -10;
      centers[2 * i] = r ? r.x : 0;
      centers[2 * i + 1] = r ? r.y : 0;
    }
    gl.uniform1fv(U.uRippleStart, starts);
    gl.uniform2fv(U.uRippleCenter, centers);
    gl.uniform1f(U.uRippleCount, ripples.length);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, cols * rows);
  }
  function tick(t) {
    var dt = Math.min(0.05, (t - last) / 1000);   // cap the step if the tab was asleep
    last = t;
    now += dt;
    while (ripples.length && now - ripples[0].start > RIPPLE_SECONDS) ripples.shift();
    // Ease the circle toward the cursor, and fade it in or out, so movement feels smooth.
    var follow = 1 - Math.exp(-14 * dt), fade = 1 - Math.exp(-6 * dt);
    mouse.x += (target.x - mouse.x) * follow;
    mouse.y += (target.y - mouse.y) * follow;
    hover += (hoverTarget - hover) * fade;
    // Busy (hovering or rippling): draw every frame. Idle: only the slow twinkle, ~20 times a second.
    var busy = ripples.length > 0 || hover > 0.001 || hoverTarget > 0;
    if (busy || t - lastDraw > 50) { draw(); lastDraw = t; }
    frame = document.hidden ? 0 : requestAnimationFrame(tick);
  }
  function wake() {
    if (!frame && !document.hidden) { last = performance.now(); frame = requestAnimationFrame(tick); }
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else wake();
  });
  window.addEventListener("resize", function () { resize(); updateQuiet(); draw(); });

  function start() {
    document.body.insertBefore(canvas, document.body.firstChild);
    resize();
    updateQuiet();
    applyTheme();
    draw();
    wake();
  }
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
