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

    // A short mechanical "click" made in the browser with the Web Audio API (no sound file):
    // a tiny burst of noise for the snap plus a quick low thump for the body of the switch.
    var audio = null;
    function clickSound(on) {
      try {
        audio = audio || new (window.AudioContext || window.webkitAudioContext)();
        var now = audio.currentTime, out = audio.createGain();
        out.gain.value = 0.35;
        out.connect(audio.destination);
        var len = Math.floor(audio.sampleRate * 0.025), buf = audio.createBuffer(1, len, audio.sampleRate), d = buf.getChannelData(0);
        for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
        var snap = audio.createBufferSource(), hp = audio.createBiquadFilter();
        snap.buffer = buf; hp.type = "highpass"; hp.frequency.value = on ? 2400 : 1800;
        snap.connect(hp); hp.connect(out); snap.start(now);
        var thump = audio.createOscillator(), tg = audio.createGain();
        thump.frequency.setValueAtTime(on ? 190 : 150, now);
        thump.frequency.exponentialRampToValueAtTime(60, now + 0.06);
        tg.gain.setValueAtTime(0.6, now);
        tg.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        thump.connect(tg); tg.connect(out); thump.start(now); thump.stop(now + 0.08);
      } catch (e) {}   // no sound support: the switch still works silently
    }

    btn.addEventListener("click", function () {
      clickSound(isDark());   // turning the lights on sounds a touch brighter
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      save(next);
      render();
    });

    // ---- the record player, top right ----
    // Click the record: the needle swings onto it and a random song plays right here on the page
    // (through YouTube's embeddable player, kept hidden). Click again: the needle lifts, music stops.
    // SONGS holds YouTube video IDs: the part after "v=" in a music.youtube.com/watch?v=... link.
    // Until songs are added, clicking opens the YouTube Music channel instead.
    var SONGS = [
      "ZoSD4l32m2I",
    ];
    var CHANNEL = "https://music.youtube.com/@itshravanlad";

    // Engraved-style record drawn from scratch: many thin grooves, a light band, a label, a hole.
    var grooves = "";
    for (var r = 18; r > 8.5; r -= 0.8) grooves += '<circle class="groove" cx="20" cy="20" r="' + r.toFixed(1) + '"/>';
    var player = document.createElement("button");
    player.className = "vinyl";
    player.type = "button";
    player.setAttribute("aria-label", SONGS.length ? "play a song i like" : "open my YouTube Music");
    player.setAttribute("aria-pressed", "false");
    player.innerHTML =
      '<svg viewBox="0 0 52 44" aria-hidden="true" focusable="false">' +
        '<g class="record">' +
          '<circle class="disc" cx="20" cy="22" r="19.5" transform="translate(0 0)"/>' +
          '<g transform="translate(0 2)">' + grooves + '</g>' +
          '<path class="shine" d="M8 13 A15 15 0 0 1 17 7.2"/>' +
          '<path class="shine" d="M32 31 A15 15 0 0 1 23 36.8"/>' +
          '<circle class="label" cx="20" cy="22" r="6.5"/>' +
          '<circle class="label-ring" cx="20" cy="22" r="4.5"/>' +
          '<circle class="hole" cx="20" cy="22" r="1.1"/>' +
        '</g>' +
        '<g class="arm">' +                                   // tonearm, pivots at the top right
          '<circle class="pivot" cx="46" cy="5" r="3"/>' +
          '<path class="arm-line" d="M46 5 L44 26 L36 33"/>' +
          '<rect class="head" x="32.5" y="31" width="5" height="4" rx="0.8" transform="rotate(-40 35 33)"/>' +
        '</g>' +
      '</svg>';
    document.body.insertBefore(player, document.body.firstChild);

    var yt = null, ytReady = false, wantPlay = false;
    function pick() { return SONGS[Math.floor(Math.random() * SONGS.length)]; }
    function loadYouTube() {
      var holder = document.createElement("div");
      holder.id = "yt-player";
      holder.className = "yt-hidden";
      document.body.appendChild(holder);
      window.onYouTubeIframeAPIReady = function () {
        yt = new YT.Player("yt-player", {
          height: "1", width: "1", videoId: pick(),
          playerVars: { autoplay: 1, playsinline: 1, start: 28 },
          events: {
            onReady: function () { ytReady = true; if (wantPlay) yt.playVideo(); },
            onStateChange: function (e) { if (e.data === 0) yt.loadVideoById({ videoId: pick(), startSeconds: 28 }); }   // song ended: next random one
          }
        });
      };
      var s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
    player.addEventListener("click", function () {
      if (!SONGS.length) { window.open(CHANNEL, "_blank", "noopener"); return; }
      var playing = player.getAttribute("aria-pressed") === "true";
      player.setAttribute("aria-pressed", playing ? "false" : "true");   // CSS swings the needle
      if (playing) { wantPlay = false; if (ytReady) yt.pauseVideo(); return; }
      wantPlay = true;
      if (!yt) loadYouTube();
      else if (ytReady) yt.playVideo();
    });

    // The top bar's backdrop shows only once the page has scrolled (see .scrolled in styles.css).
    function onScroll() { root.classList.toggle("scrolled", window.scrollY > 4); }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // If the device setting changes and you haven't chosen yourself, follow it.
    media.addEventListener("change", render);
  });
})();
