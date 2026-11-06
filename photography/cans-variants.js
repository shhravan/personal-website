// TEST ONLY: three film can designs for the photography landing, picked with ?__variant=
// (litho, matte, bulk, vintage, retro). Removed, with cans-variants.css, once one is chosen.
(function () {
  var VARIANTS = [["litho", "Printed tin"], ["matte", "Matte pro"], ["bulk", "Bulk roll"], ["vintage", "Vintage tin"], ["retro", "70s retro"]];
  var q = new URLSearchParams(location.search), v = q.get("__variant");
  if (!VARIANTS.some(function (x) { return x[0] === v; })) return;
  var uid = 0;

  // ---- one can, drawn as an upright cylinder with a lit side, ribbed lids and the film tongue out of the slit ----
  function can(kind, roll) {
    var id = "c" + (++uid), film = roll === 0;
    var lid = kind === "matte" ? ["#0c0c0c", "#3a3a3a", "#1a1a1a", "#050505"]
      : kind === "vintage" ? ["#5f584c", "#ddd3c0", "#a39a88", "#4a443a"]
      : ["#6f6f6c", "#f4f3ef", "#b9b8b2", "#5c5c58"];
    var body;
    if (kind === "litho") body = film ? ["#f2b705", "#d12f1f"] : ["#efe9da", "#1f5a43"];
    else if (kind === "matte") body = ["#1b1a18", "#1b1a18"];
    else if (kind === "vintage") body = film ? ["#e6d6b4", "#6e1f1a"] : ["#e6d6b4", "#1f3b57"];
    else if (kind === "retro") body = ["#f1e2c2", film ? "#e0702b" : "#3f7f86"];
    else body = ["#c9c8c2", "#c9c8c2"];
    var s = '<svg viewBox="0 0 250 270" class="can-art" aria-hidden="true" focusable="false"><defs>' +
      '<linearGradient id="' + id + 'sh" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".62"/><stop offset=".1" stop-color="#000" stop-opacity=".22"/>' +
      '<stop offset=".27" stop-color="#fff" stop-opacity=".42"/><stop offset=".34" stop-color="#fff" stop-opacity=".08"/><stop offset=".62" stop-color="#000" stop-opacity=".06"/>' +
      '<stop offset=".88" stop-color="#000" stop-opacity=".38"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></linearGradient>' +
      '<linearGradient id="' + id + 'lid" x1="0" x2="1"><stop offset="0" stop-color="' + lid[3] + '"/><stop offset=".26" stop-color="' + lid[1] + '"/>' +
      '<stop offset=".45" stop-color="' + lid[2] + '"/><stop offset=".8" stop-color="' + lid[0] + '"/><stop offset="1" stop-color="' + lid[3] + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + lid[1] + '"/><stop offset="1" stop-color="' + lid[0] + '"/></linearGradient>' +
      '<pattern id="' + id + 'rib" width="3.2" height="10" patternUnits="userSpaceOnUse"><rect width="1.3" height="10" fill="#000" opacity=".22"/></pattern>' +
      '<pattern id="' + id + 'brush" width="200" height="1.6" patternUnits="userSpaceOnUse"><rect width="200" height=".6" fill="#fff" opacity=".18"/></pattern>' +
      '<linearGradient id="' + id + 'film" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a3414"/><stop offset=".5" stop-color="#b8612c"/><stop offset="1" stop-color="#6b2c10"/></linearGradient>' +
      '<filter id="' + id + 'blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>' +
      '<filter id="' + id + 'grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="' + (roll + 3) + '"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .27  0 0 0 0 .18  0 0 0 1.4 -.55"/></filter>' +
      '<filter id="' + id + 'rust" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="3" seed="' + (roll + 7) + '"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .25  0 0 0 0 .12  0 0 0 2.2 -1.25"/></filter>' +
      '<clipPath id="' + id + 'body"><rect x="30" y="52" width="120" height="176"/></clipPath></defs>';
    // shadow on the table
    s += '<ellipse class="can-shadow" cx="100" cy="246" rx="78" ry="9" fill="#000" opacity=".32" filter="url(#' + id + 'blur)"/>';
    // the film tongue, out of the felt slit on the right
    s += '<g class="can-film"><path d="M146 78 H206 C214 78 214 86 214 92 V140 H236 C242 140 242 146 242 150 V196 C242 204 236 206 230 206 H146 Z" fill="url(#' + id + 'film)"/>';
    for (var i = 0; i < 9; i++) s += '<rect x="' + (152 + i * 10) + '" y="84" width="5" height="7" rx="1" fill="#2a1206" opacity=".75"/><rect x="' + (152 + i * 10) + '" y="193" width="5" height="7" rx="1" fill="#2a1206" opacity=".75"/>';
    s += '<path d="M146 80 H210" stroke="#fff" stroke-opacity=".22"/><rect x="146" y="78" width="60" height="128" fill="url(#' + id + 'sh)" opacity=".25"/></g>';
    // body
    s += '<g clip-path="url(#' + id + 'body)"><rect x="30" y="52" width="120" height="176" fill="' + body[0] + '"/>';
    if (kind === "litho") {
      s += '<rect x="30" y="52" width="120" height="58" fill="' + body[1] + '"/><rect x="30" y="176" width="120" height="52" fill="' + body[1] + '"/>';
      s += '<rect x="30" y="112" width="120" height="3" fill="' + body[1] + '"/><rect x="30" y="170" width="120" height="3" fill="' + body[1] + '"/>';
      s += '<text x="84" y="94" text-anchor="middle" font-family="Arial Black, Helvetica, sans-serif" font-weight="900" font-size="27" letter-spacing="-1" fill="' + (film ? "#f2b705" : "#efe9da") + '">shrvn</text>';
      s += '<text x="84" y="157" text-anchor="middle" font-family="Arial Black, Helvetica, sans-serif" font-weight="900" font-size="40" fill="' + body[1] + '">' + (film ? "400" : "100") + '</text>';
      s += '<text x="84" y="134" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="9" letter-spacing="2" fill="#1a1a1a">' + (film ? "FILM GALLERY" : "COMMERCIAL") + '</text>';
      s += '<text x="84" y="203" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="10" letter-spacing="1.5" fill="' + (film ? "#f2b705" : "#efe9da") + '">135 · ' + (film ? "36" : "24") + ' EXP</text>';
    } else if (kind === "matte") {
      s += '<rect x="30" y="52" width="120" height="176" fill="url(#' + id + 'rib)" opacity=".18"/>';
      s += '<text x="84" y="90" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="11" letter-spacing="3" fill="#e9e5da" opacity=".8">SHRVN</text>';
      s += '<text x="84" y="150" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="300" font-size="44" fill="#f3efe4">' + (film ? "400" : "100") + '</text>';
      s += '<rect x="58" y="164" width="52" height="1" fill="' + (film ? "#e0a32a" : "#5fa37f") + '"/>';
      s += '<text x="84" y="182" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="8" letter-spacing="2.4" fill="#e9e5da" opacity=".75">' + (film ? "FILM GALLERY" : "COMMERCIAL") + '</text>';
      s += '<text x="84" y="210" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="7" letter-spacing="2" fill="#e9e5da" opacity=".45">135-' + (film ? "36" : "24") + '</text>';
    } else if (kind === "vintage") {
      // a 1950s tin: deco bands, gold pinstripes, a serif name, and decades of wear
      s += '<rect x="30" y="52" width="120" height="44" fill="' + body[1] + '"/><rect x="30" y="186" width="120" height="42" fill="' + body[1] + '"/>';
      s += '<rect x="30" y="98" width="120" height="1.5" fill="#b48a3c"/><rect x="30" y="101" width="120" height=".8" fill="#b48a3c"/>';
      s += '<rect x="30" y="181" width="120" height=".8" fill="#b48a3c"/><rect x="30" y="183" width="120" height="1.5" fill="#b48a3c"/>';
      s += '<text x="84" y="82" text-anchor="middle" font-family="EB Garamond, Georgia, serif" font-weight="700" font-size="24" letter-spacing="3" fill="#e9d9b0">SHRVN</text>';
      s += '<path d="M54 118 h60 M54 166 h60" stroke="' + body[1] + '" stroke-width=".8"/>';
      s += '<text x="84" y="133" text-anchor="middle" font-family="EB Garamond, Georgia, serif" font-style="italic" font-size="13" fill="' + body[1] + '">' + (film ? "Film Gallery" : "Commercial") + '</text>';
      s += '<text x="84" y="152" text-anchor="middle" font-family="EB Garamond, Georgia, serif" font-size="8" letter-spacing="2.5" fill="#3b2a1c">PANCHROMATIC</text>';
      s += '<text x="84" y="161" text-anchor="middle" font-family="EB Garamond, Georgia, serif" font-size="6" letter-spacing="2" fill="#3b2a1c" opacity=".8">' + (film ? "36 EXPOSURES" : "24 EXPOSURES") + '</text>';
      s += '<text x="84" y="210" text-anchor="middle" font-family="EB Garamond, Georgia, serif" font-size="9" letter-spacing="2" fill="#e9d9b0">NO. 135 · MCMLVI</text>';
      s += '<rect x="30" y="52" width="120" height="176" filter="url(#' + id + 'grain)"/>';
      s += '<rect x="30" y="52" width="120" height="176" filter="url(#' + id + 'rust)" opacity=".7"/>';
      s += '<path d="M48 70 l22 9 M96 140 l30 -6 M60 196 l14 12 M110 64 l-8 20" stroke="#fff" stroke-opacity=".35" stroke-width=".6"/>';
      s += '<rect x="30" y="52" width="120" height="176" fill="#c9a86a" opacity=".12"/>';
    } else if (kind === "retro") {
      // a 1970s roll: sunset stripes wrapping round, chunky rounded type
      var st = film ? ["#e3a92b", "#e0702b", "#9c3d1c"] : ["#9cc5b7", "#3f7f86", "#24485a"];
      s += '<rect x="30" y="52" width="120" height="26" fill="' + st[2] + '"/>';
      s += '<rect x="30" y="150" width="120" height="13" fill="' + st[0] + '"/><rect x="30" y="165" width="120" height="13" fill="' + st[1] + '"/><rect x="30" y="180" width="120" height="13" fill="' + st[2] + '"/>';
      s += '<text x="84" y="71" text-anchor="middle" font-family="Arial Rounded MT Bold, Trebuchet MS, Helvetica, sans-serif" font-weight="700" font-size="14" letter-spacing="1" fill="#f1e2c2">shrvn color</text>';
      s += '<text x="84" y="125" text-anchor="middle" font-family="Arial Rounded MT Bold, Trebuchet MS, Helvetica, sans-serif" font-weight="900" font-size="38" fill="' + st[1] + '">' + (film ? "200" : "100") + '</text>';
      s += '<text x="84" y="142" text-anchor="middle" font-family="Trebuchet MS, Helvetica, sans-serif" font-weight="700" font-size="8.5" letter-spacing="1.6" fill="#3a2a1e">' + (film ? "FILM GALLERY" : "COMMERCIAL") + '</text>';
      s += '<text x="84" y="214" text-anchor="middle" font-family="Trebuchet MS, Helvetica, sans-serif" font-weight="700" font-size="8" letter-spacing="1.5" fill="#3a2a1e">C-41 · ' + (film ? "36" : "24") + ' EXP · \'74</text>';
      s += '<rect x="30" y="52" width="120" height="176" filter="url(#' + id + 'grain)" opacity=".6"/>';
      s += '<rect x="30" y="52" width="120" height="176" fill="#f6d9a0" opacity=".12"/>';
    } else {
      s += '<rect x="30" y="52" width="120" height="176" fill="url(#' + id + 'brush)"/>';
      // masking tape label, written on in marker
      s += '<g transform="rotate(-4 88 140)"><path d="M26 110 l6 -2 l5 2 l6 -1 l120 0 l4 2 v54 l-5 1 l-4 -2 l-6 2 h-120 l-5 -1 z" fill="#e8dcb8"/>' +
        '<path d="M26 110 h132 v56 h-132 z" fill="#fff" opacity=".12"/>' +
        '<text x="88" y="136" text-anchor="middle" font-family="Permanent Marker, Marker Felt, cursive" font-size="17" fill="#1d1b17">' + (film ? "film gallery" : "commercial") + '</text>' +
        '<text x="88" y="156" text-anchor="middle" font-family="Permanent Marker, Marker Felt, cursive" font-size="10" fill="#1d1b17" opacity=".8">' + (film ? "36x · '23-'26" : "24x · clients") + '</text></g>';
    }
    s += '<rect x="30" y="52" width="120" height="176" fill="url(#' + id + 'sh)"/></g>';
    // felt light trap
    s += '<rect x="144" y="70" width="7" height="144" rx="2" fill="#141210"/>';
    // lids, top and bottom, and the spool end on top
    function lidAt(y) {
      return '<rect x="24" y="' + y + '" width="132" height="16" fill="url(#' + id + 'lid)"/><rect x="24" y="' + y + '" width="132" height="16" fill="url(#' + id + 'rib)"/>' +
        '<rect x="24" y="' + (y + 15) + '" width="132" height="1.5" fill="#000" opacity=".35"/>';
    }
    s += lidAt(36) + '<ellipse cx="90" cy="36" rx="66" ry="6" fill="url(#' + id + 'top)"/><ellipse cx="90" cy="36" rx="14" ry="3" fill="#000" opacity=".25"/>' +
      '<rect x="76" y="14" width="28" height="22" fill="url(#' + id + 'lid)"/><ellipse cx="90" cy="14" rx="14" ry="4" fill="url(#' + id + 'top)"/><rect x="86" y="11" width="8" height="5" rx="1" fill="#000" opacity=".5"/>';
    s += lidAt(224) + '<path d="M24 240 a66 6 0 0 0 132 0" fill="url(#' + id + 'lid)"/>';
    return s + "</svg>";
  }

  // ---- the landing: two cans, nothing else ----
  var main = document.querySelector("main.photos");
  var land = document.createElement("section");
  land.className = "can-landing can-" + v;
  land.setAttribute("aria-label", "choose a roll");
  [["film gallery", "36 exposures · personal"], ["commercial", "24 exposures · for clients"]].forEach(function (r, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "can";
    b.setAttribute("aria-label", "open " + r[0]);
    b.innerHTML = can(v, i) + '<span class="can-name">' + r[0] + '</span><span class="can-sub">' + r[1] + "</span>";
    b.addEventListener("click", function () {
      document.body.classList.remove("cans-on");
      var tabs = document.querySelectorAll(".photo-tabs button");
      if (tabs[i]) tabs[i].click();
    });
    land.appendChild(b);
  });
  main.insertBefore(land, main.firstChild);
  document.body.classList.add("cans-on");

  // ---- the picker (deliberately not in the site's style) ----
  var arrow = '<svg aria-hidden="true" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v4a3 3 0 0 0 3 3h7"/><path d="m10 7 3 3-3 3"/></svg>';
  var pick = document.createElement("div");
  pick.className = "variant-dock";
  pick.innerHTML = '<nav class="variant-picker" aria-label="Variants"><div class="variant-picker-group" role="group" aria-labelledby="variants-finish">' +
    '<span class="variant-picker-heading" id="variants-finish">' + arrow + 'Label and finish</span>' +
    VARIANTS.map(function (x) { return '<button type="button" data-variant="' + x[0] + '" aria-pressed="' + (x[0] === v) + '">' + x[1] + "</button>"; }).join("") +
    '</div></nav><div class="variant-picker-select"><select aria-label="Variant"><optgroup label="Label and finish">' +
    VARIANTS.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === v ? " selected" : "") + ">" + x[1] + "</option>"; }).join("") +
    '</optgroup></select><svg aria-hidden="true" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m4 6 4 4 4-4"/></svg></div>';
  document.body.appendChild(pick);
  function go(name) { q.set("__variant", name); location.search = q.toString(); }
  pick.querySelectorAll("button").forEach(function (b) { b.addEventListener("click", function () { go(b.dataset.variant); }); });
  pick.querySelector("select").addEventListener("change", function (e) { go(e.target.value); });
  document.addEventListener("keydown", function (e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
    if (e.key === "h" || e.key === "H") { pick.hidden = !pick.hidden; return; }
    var k = VARIANTS.findIndex(function (x) { return x[0] === v; });
    if (e.key === "ArrowDown" || e.key === "ArrowRight") go(VARIANTS[(k + 1) % VARIANTS.length][0]);
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") go(VARIANTS[(k + VARIANTS.length - 1) % VARIANTS.length][0]);
  });
})();
