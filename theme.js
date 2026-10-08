// Light / dark mode, shared by every page.
// How it picks: your saved choice wins; otherwise it follows your device's setting.
// How you switch: click or tap any empty space on the page (not on text, a photo or a link).
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

  document.addEventListener("DOMContentLoaded", function () {
    // A real button for keyboard and screen-reader users. It is invisible until you Tab to it.
    var btn = document.createElement("button");
    btn.className = "theme-toggle";
    btn.type = "button";
    document.body.appendChild(btn);

    // The label names the mode you would switch TO.
    function label() {
      btn.textContent = isDark() ? "switch to light mode" : "switch to dark mode";
    }
    label();

    function toggle() {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      save(next);
      label();
    }
    btn.addEventListener("click", toggle);

    // Clicking empty space: the click landed on the page itself (html or body) or on the
    // empty parts of the main column, not on any element inside it.
    document.addEventListener("click", function (e) {
      var t = e.target;
      if (t === document.documentElement || t === document.body || t.tagName === "MAIN") toggle();
    });

    // If the device setting changes and you haven't chosen yourself, follow it.
    media.addEventListener("change", label);
  });
})();
