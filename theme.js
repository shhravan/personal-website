// Light / dark mode, shared by every page.
// How it picks: your saved choice wins; otherwise it follows your device's setting.
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
    var btn = document.createElement("button");
    btn.className = "theme-toggle";
    btn.type = "button";
    document.body.appendChild(btn);

    // The button names the mode you would switch TO.
    function label() {
      btn.textContent = isDark() ? "light" : "dark";
      btn.setAttribute("aria-label", isDark() ? "switch to light mode" : "switch to dark mode");
    }
    label();

    btn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      save(next);
      label();
    });

    // If the device setting changes and you haven't chosen yourself, follow it.
    media.addEventListener("change", label);
  });
})();
