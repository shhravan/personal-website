// Light / dark mode, shared by every page.
// How it picks: your saved choice wins; otherwise it follows your device's setting.
// How you switch: the little wall light switch in the top-left corner. Lights on = light mode.
(function () {
  var KEY = "theme";
  var root = document.documentElement;
  var media = window.matchMedia("(prefers-color-scheme: dark)");

  // localStorage is the browser's small memory for a site. It can be blocked, so we guard it.
  function load() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  // Apply a saved choice immediately (this script is in <head>, so there is no flash).
  var saved = load();
  if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);

  function isDark() {
    var t = root.getAttribute("data-theme");
    return t ? t === "dark" : media.matches;
  }

  // The switch drawing: a wall plate seen from slightly to the side, four screws, a slot,
  // and a lever that sits at the top (on) or the bottom (off). Drawn from scratch.
  var DRAWING =
    '<svg viewBox="0 0 44 62" aria-hidden="true" focusable="false">' +
      '<path class="side" d="M8 2 L2 8 L2 60 L8 54 Z"/>' +          // left edge of the box
      '<path class="side" d="M8 54 L2 60 L36 60 L42 54 Z"/>' +      // bottom edge of the box
      '<rect class="plate" x="8" y="2" width="34" height="52" rx="2"/>' +
      '<circle class="screw" cx="13" cy="8" r="1.4"/>' +
      '<circle class="screw" cx="37" cy="8" r="1.4"/>' +
      '<circle class="screw" cx="13" cy="48" r="1.4"/>' +
      '<circle class="screw" cx="37" cy="48" r="1.4"/>' +
      '<rect class="slot" x="19" y="14" width="12" height="26" rx="1"/>' +
      '<g class="lever">' +
        '<rect class="lever-face" x="20" y="15.5" width="10" height="10.5"/>' +
        '<rect class="lever-lip" x="20" y="14" width="10" height="2"/>' +
      '</g>' +
    '</svg>';

  // The little "on" / "off" label uses a pixel font (Silkscreen). Every page has this script,
  // so it loads the font here once, asking for only the three letters it needs (O, N, F).
  var pixel = document.createElement("link");
  pixel.rel = "stylesheet";
  pixel.href = "https://fonts.googleapis.com/css2?family=Silkscreen&text=ONFonf&display=swap";
  document.head.appendChild(pixel);

  document.addEventListener("DOMContentLoaded", function () {
    // role="switch" tells screen readers it is an on/off switch; aria-checked is its state.
    var btn = document.createElement("button");
    btn.className = "switch";
    btn.type = "button";
    btn.setAttribute("role", "switch");
    btn.setAttribute("aria-label", "lights");
    btn.innerHTML = DRAWING + '<span class="switch-text"></span>';
    document.body.insertBefore(btn, document.body.firstChild);

    var text = btn.querySelector(".switch-text");
    function render() {
      var dark = isDark();
      btn.setAttribute("aria-checked", dark ? "false" : "true");   // lights on = light mode
      text.textContent = dark ? "off" : "on";
      btn.title = dark ? "turn the lights on" : "turn the lights off";
    }
    render();

    btn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      save(next);
      render();
    });

    // If the device setting changes and you haven't chosen yourself, follow it.
    media.addEventListener("change", render);
  });
})();
