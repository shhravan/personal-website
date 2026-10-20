// The faint field of letters behind every page.
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
  var MAX_SPLASH = 12;       // ripples stirred up by moving the cursor over the water
  var SPLASH_SECONDS = 2.4;  // how long each of those lasts

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
    "uniform float uSplashStart[" + MAX_SPLASH + "];   // water ripples from the cursor",
    "uniform vec2 uSplashCenter[" + MAX_SPLASH + "];",
    "uniform float uSplashCount;",
    "uniform vec2 uFlow;              // how far the cursor has pushed the water sideways",
    "uniform float uRippleMax;        // how far a ripple travels, in cells",
    "uniform float uRippleWidth;      // wave thickness, in cells",
    "uniform float uBase;             // normal letter strength (very faint)",
    "uniform float uBright;           // strength of letters on a ripple's wave",
    "uniform float uDark;             // 1 in dark mode",
    "uniform vec3 uColor;             // normal letter color (the text color)",
    "uniform float uShore;            // the bottom of the page, in rows from the top of the window",
    "uniform vec4 uQuiet;             // the content column (x0, y0, x1, y1 in cells): letters are fainter there",
    "out vec2 vUv;",
    "out float vAlpha;",
    "out vec3 vColor;",
    "out vec4 vTile;                  // a colored tile behind the letter (inside the painting only)",
    "out vec2 vPos;                   // where this corner is, in cells (for per-pixel water light)",
    "out float vWater;                // how much pool light to show here (0 outside the water)",
    "",
    "float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",
    "float hash1(float x) { return fract(sin(x * 12.9898) * 43758.5453); }",
    "float dist(vec2 d) { d.y *= uAspect; return length(d); }",
    "float randomLetter(float seed, float count) { return 1.0 + floor(hash1(seed) * (count - 1.0)); }",
    "",
    "float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }",
    "",
    "// How far up the water reaches in column x (in cells) right now.",
    "float reachAt(float x) {",
    "  float period = 4.8;",
    "  float lag = 1.6 * vnoise(vec2(x * 0.025, 3.0)) + 0.6 * vnoise(vec2(x * 0.08, 7.0));",
    "  float tt = uTime / period + lag;",
    "  float p = fract(tt);",
    "  float cycle = p < 0.27 ? 1.0 - pow(1.0 - p / 0.27, 3.0)        // surge: quick, slowing at the top",
    "                         : 1.0 - smoothstep(0.0, 1.0, (p - 0.27) / 0.73);   // backwash: slow drain",
    "  float strength = 0.55 + 0.6 * vnoise(vec2(x * 0.03, floor(tt) * 1.7));   // each wave differs",
    "  return uGrid.y * (0.045 + 0.12 * cycle * strength)",
    "      + 2.5 * vnoise(vec2(x * 0.12, uTime * 0.4)) + 1.5 * vnoise(vec2(x * 0.5, uTime * 0.9));",
    "}",
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
    "  // Shore: foam washing up from the bottom edge of the page, like a beach seen from above",
    "  // (upside down). The edge rises for a moment and slides back every ~4.5 seconds; its lacy",
    "  // outline comes from noise, so it never looks like a straight line.",
    "  float up = uShore - cell.y;                        // cells above the bottom of the page",
    "  float xw = cell.x / uGrid.x;",
    "  // Real swash is lopsided: the foam surges up fast (~1.3 s), then drains back slowly (~3.5 s).",
    "  // Different stretches of the shore are a bit ahead or behind each other, and each wave",
    "  // reaches a different height, so the edge is uneven and never repeats exactly.",
    "  float reach = reachAt(cell.x);",
    "  float edgeDist = reach - up;                       // > 0 inside the water",
    "  float inWater = step(0.0, edgeDist);",
    "  vWater = 0.0;",
    "  if (edgeDist > -1.0) {",
    "    float lace = 0.6 * vnoise(vec2((cell.x + uFlow.x) * 0.9, cell.y * 1.2 + uTime * 0.8)) + 0.4 * vnoise(vec2((cell.x + uFlow.x) * 2.1, cell.y * 2.5 - uTime));",
    "    // Rings spreading out from where the cursor touched the water.",
    "    float splash = 0.0;",
    "    for (int i = 0; i < " + MAX_SPLASH + "; i++) {",
    "      if (float(i) >= uSplashCount) break;",
    "      float st = (uTime - uSplashStart[i]) / " + SPLASH_SECONDS.toFixed(2) + ";",
    "      if (st < 0.0 || st > 1.0) continue;",
    "      float sd = dist(cell - uSplashCenter[i]);",
    "      float sr = st * 26.0;",
    "      float band = 1.0 - smoothstep(0.0, 1.4, abs(sd - sr));",
    "      float band2 = 1.0 - smoothstep(0.0, 1.0, abs(sd - sr * 0.62));",
    "      splash += (band + 0.6 * band2) * (1.0 - st) * (1.0 - st);",
    "    }",
    "    splash = min(splash, 1.0);",
    "    float rim = 1.0 - smoothstep(0.0, 1.6, abs(edgeDist));          // bright frothy edge",
    "    float wash = step(0.0, edgeDist) * smoothstep(0.5, 0.7, lace) * (1.0 - smoothstep(4.0, 14.0, edgeDist) * 0.6);  // lacy foam behind it",
    "    float behind = 1.0 - 0.85 * quiet;",
    "    // Like a real shoreline from above: creamy white foam at the edge, then water that goes from a",
    "    // pale shallow turquoise to a deeper blue further out. All kept very faint.",
    "    float inside = step(0.0, edgeDist);",
    "    float depth = smoothstep(1.0, 22.0, edgeDist);",
    "    vec3 shallow = uDark > 0.5 ? vec3(0.30, 0.68, 0.92) : vec3(0.24, 0.62, 0.86);   // pool blue (a touch brighter on dark so it isn't murky)",
    "    vec3 deep    = uDark > 0.5 ? vec3(0.14, 0.46, 0.80) : vec3(0.08, 0.38, 0.72);",
        "    vec3 foamCol = vec3(0.96, 0.93, 0.85);             // creamy white",
    "    // On cream, white foam just looks like faded blocks, so there the lacy foam stays mostly blue.",
    "    float foam = max(rim * (0.6 + 0.4 * lace), wash * (uDark > 0.5 ? 0.5 : 0.1));",
    "    float foamA = max(0.32 * rim * (0.6 + 0.4 * lace), 0.12 * wash);",
    "    // On cream the same blue needs more strength to look as blue as it does on dark.",
    "    float bodyA = inside * (uDark > 0.5 ? 0.20 + 0.18 * depth : 0.38 + 0.30 * depth);",
    "    // The cursor stirs the water instead of erasing it, so the hover circle is left out here.",
    "    vWater = inside * smoothstep(0.0, 4.0, edgeDist) * behind;",
    "    vec3 sea = mix(mix(shallow, deep, depth), foamCol, clamp(foam * 1.6 + splash * inside * 0.7, 0.0, 1.0));",
    "    tile = vec4(sea, (max(foamA, bodyA) + splash * inside * 0.22) * behind);",
    "    tint = mix(uColor, mix(shallow, foamCol, 0.5), 0.5 * inside);",
    "    alpha = max(alpha, step(0.0, edgeDist) * 0.14 * behind);",
    "  }",
    "  vColor = tint;",
    "  vPos = cell + aCorner;",
    "  vTile = tile;",
    "  alpha *= 1.0 - near * (1.0 - inWater);",
    "  alpha = mix(alpha, 0.0, off * (1.0 - inWater));",
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
    "precision highp float;",
    "uniform sampler2D uAtlas;",
    "in vec3 vColor;",
    "in vec4 vTile;",
    "in vec2 vUv;",
    "in float vAlpha;",
    "in vec2 vPos;",
    "in float vWater;",
    "uniform float uTime;",
    "uniform float uAspect;",
    "uniform float uDark;",
    "uniform vec2 uFlow;",
    "out vec4 color;",
    "// Caustics: the bright, wobbly net of light you see on the floor of a pool. A few rounds of",
    "// bending the coordinates with sines and cosines make thin bright lines that drift and morph.",
    "float caustic(vec2 p, float t) {",
    "  vec2 q = mod(p, 6.2831853) - 250.0;",
    "  vec2 i = q; float c = 1.0;",
    "  for (int n = 0; n < 4; n++) {",
    "    float tt = t * (1.0 - 3.5 / float(n + 1));",
    "    i = q + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));",
    "    c += 1.0 / length(vec2(q.x / (sin(i.x + tt) / 0.005), q.y / (cos(i.y + tt) / 0.005)));",
    "  }",
    "  c = 1.17 - pow(c / 4.0, 1.4);",
    "  return clamp(pow(abs(c), 8.0), 0.0, 1.0);",
    "}",
    "void main() {",
    "  float a = texture(uAtlas, vUv).a * vAlpha;          // the letter",
    "  float t = vTile.a * (1.0 - a);                       // the tile shows around the letter",
    "  color = vec4(vColor * a + vTile.rgb * t, a + t);     // colors pre-multiplied by opacity",
    "  // Pool light, worked out for every pixel so the lines stay thin and sharp.",
    "  if (vWater > 0.0) {",
    "    float g = caustic((vec2(vPos.x, vPos.y * uAspect) + uFlow) * 0.22, uTime * 0.35) * vWater * (uDark > 0.5 ? 0.45 : 0.85);",
    "    color = vec4(color.rgb * (1.0 - g) + vec3(0.86, 0.95, 1.0) * g, color.a + g * (1.0 - color.a));",
    "  }",
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
   "uRippleStart", "uRippleCenter", "uRippleCount", "uSplashStart", "uSplashCenter", "uSplashCount", "uFlow", "uRippleMax", "uRippleWidth", "uBase", "uBright",
   "uAtlas", "uColor", "uQuiet", "uShore", "uDark"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

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
  }

  // The content column, in cells, padded a little. Updated on resize and scroll.
  function updateQuiet() {
    var main = document.querySelector("main");
    if (!main) return;
    var r = main.getBoundingClientRect();
    gl.uniform4f(U.uQuiet, (r.left - 12) / CELL_W, (r.top - 12) / CELL_H, (r.right + 12) / CELL_W, (r.bottom + 12) / CELL_H);
    // The water sits at the bottom of the page, not the window: on a long page it stays out of
    // sight below and rolls into view as you scroll to the end.
    var bottom = Math.max(window.innerHeight, document.documentElement.scrollHeight - window.scrollY);
    shoreRow = bottom / CELL_H;
    gl.uniform1f(U.uShore, shoreRow);
  }
  window.addEventListener("scroll", function () { updateQuiet(); draw(); }, { passive: true });
  document.addEventListener("page:load", function () { updateQuiet(); draw(); });   // new page, new column

  // ---- cursor and clicks ----
  var mouse = { x: -999, y: -999 }, target = { x: -999, y: -999 }, hover = 0, hoverTarget = 0;
  var ripples = [];   // { start, x, y } in seconds and cells
  // Moving the cursor over the water drops small ripples and pushes the current along with it.
  var splashes = [], lastSplash = { x: -999, y: -999, t: -1 }, shoreRow = 0;
  var flow = { x: 0, y: 0 }, flowVel = 0;
  function toCells(e) { return { x: e.clientX / CELL_W, y: e.clientY / CELL_H }; }
  window.addEventListener("pointermove", function (e) {
    var prevX = target.x;
    target = toCells(e);
    if (target.y > shoreRow - rows * 0.2) {   // near the bottom, where the water is
      var moved = Math.abs(target.x - lastSplash.x) + Math.abs(target.y - lastSplash.y);
      if (moved > 2.5 && now - lastSplash.t > 0.09) {
        splashes.push({ start: now, x: target.x, y: target.y });
        if (splashes.length > MAX_SPLASH) splashes.shift();
        lastSplash = { x: target.x, y: target.y, t: now };
      }
      if (prevX > -900) flowVel += (target.x - prevX) * 0.6;   // drag left or right to steer the current
    }
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
  var sStarts = new Float32Array(MAX_SPLASH), sCenters = new Float32Array(MAX_SPLASH * 2);
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
    for (var j = 0; j < MAX_SPLASH; j++) {
      var sp = splashes[j];
      sStarts[j] = sp ? sp.start : -10;
      sCenters[2 * j] = sp ? sp.x : 0;
      sCenters[2 * j + 1] = sp ? sp.y : 0;
    }
    gl.uniform1fv(U.uSplashStart, sStarts);
    gl.uniform2fv(U.uSplashCenter, sCenters);
    gl.uniform1f(U.uSplashCount, splashes.length);
    gl.uniform2f(U.uFlow, flow.x, flow.y);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, cols * rows);
  }
  function tick(t) {
    var dt = Math.min(0.05, (t - last) / 1000);   // cap the step if the tab was asleep
    last = t;
    now += dt;
    while (ripples.length && now - ripples[0].start > RIPPLE_SECONDS) ripples.shift();
    while (splashes.length && now - splashes[0].start > SPLASH_SECONDS) splashes.shift();
    // The push from the cursor carries the water along, then slowly settles.
    flow.x -= flowVel * dt;
    flowVel *= Math.exp(-1.2 * dt);
    // Ease the circle toward the cursor, and fade it in or out, so movement feels smooth.
    var follow = 1 - Math.exp(-14 * dt), fade = 1 - Math.exp(-6 * dt);
    mouse.x += (target.x - mouse.x) * follow;
    mouse.y += (target.y - mouse.y) * follow;
    hover += (hoverTarget - hover) * fade;
    // Busy (hovering or rippling): draw every frame. Idle: only the slow twinkle, ~20 times a second.
    var busy = ripples.length > 0 || splashes.length > 0 || Math.abs(flowVel) > 0.01 || hover > 0.001 || hoverTarget > 0;
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
  window.addEventListener("load", function () { updateQuiet(); draw(); });   // page height settles once fonts and images load

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
