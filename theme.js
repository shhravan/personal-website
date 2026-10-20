// Light / dark mode, shared by every page.
// How it picks: your saved choice wins; otherwise it follows your device's setting.
// How you switch: the little wall light switch in the top-left corner. Lights on = light mode.
(function () {
  var KEY = "theme";
  // Where the site's files live, worked out from this script's own address, so pictures load the
  // same from the home page and from section pages.
  var BASE = new URL(".", (document.currentScript && document.currentScript.src) || location.href).href;
  var root = document.documentElement;
  var media = window.matchMedia("(prefers-color-scheme: dark)");

  // localStorage is the browser's small memory for a site. It can be blocked, so we guard it.
  function load() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  // Apply a saved choice immediately (this script is in <head>, so there is no flash).
  // With no saved choice the site starts in dark mode (Shravan's pick), whatever the device says.
  var saved = load();
  root.setAttribute("data-theme", saved === "light" ? "light" : "dark");

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
    var deckSong = -1;   // on desktop, which record from TRACKS is on the turntable (-1: none yet)
    function pick() { return SONGS[Math.floor(Math.random() * SONGS.length)]; }
    function loadYouTube(preload, firstId, firstStart) {
      var holder = document.createElement("div");
      holder.id = "yt-player";
      holder.className = "yt-hidden";
      document.body.appendChild(holder);
      window.onYouTubeIframeAPIReady = function () {
        yt = new YT.Player("yt-player", {
          height: "1", width: "1", videoId: firstId || pick(),
          playerVars: { autoplay: preload ? 0 : 1, playsinline: 1, start: firstId ? firstStart : 28 },
          events: {
            onReady: function () { ytReady = true; if (wantPlay) yt.playVideo(); },
            onStateChange: function (e) {
              if (e.data !== 0) return;   // 0 means the song ended
              if (deckSong >= 0) { playTrack((deckSong + 1) % TRACKS.length); return; }   // desktop: next record
              yt.loadVideoById({ videoId: pick(), startSeconds: 28 });                    // phone: another random one
            }
          }
        });
      };
      var s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
    // Phones only let sound start during the tap itself. If the player is still loading when the
    // tap happens, the phone blocks it and you have to tap again. So on touch screens the player
    // loads quietly in the background a moment after the page, and the first tap plays at once.
    if (SONGS.length && window.matchMedia("(hover: none)").matches) {
      window.addEventListener("load", function () { setTimeout(function () { if (!yt) loadYouTube(true); }, 1200); });
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

    // ---- the record deck (desktop only) ----
    // On computers with a mouse, the small record is swapped for a big, realistic one in the top
    // right. Hovering it fans out a dial of album covers; clicking a cover plays that song straight
    // away (the dial closes and the needle drops). Clicking the record pauses or resumes.
    // Phones and tablets keep the small record above, unchanged.
    var TRACKS = [
      { id: "ZoSD4l32m2I", start: 28, title: "Memory Box", artist: "Peter Cat Recording Co.", cover: "memory-box" },
      { id: "FRpB2KRdi3w", start: 0, title: "Control Room", artist: "Peter Cat Recording Co.", cover: "control-room" },
      { id: "TvpJWAx_NkY", start: 0, title: "Portrait of a Time", artist: "Peter Cat Recording Co.", cover: "portrait-of-a-time" },
      { id: "cmpRLQZkTb8", start: 0, title: "Don't Look Back in Anger", artist: "Oasis", cover: "dont-look-back-in-anger" },
      { id: "fJ9rUzIMcZQ", start: 0, title: "Bohemian Rhapsody", artist: "Queen", cover: "bohemian-rhapsody" },
      { id: "8ifjLdWj4y0", start: 0, title: "Theme from New York, New York", artist: "Frank Sinatra", cover: "new-york-new-york" },
      { id: "1-W6whvn8Bs", start: 0, title: "Selfless", artist: "The Strokes", cover: "selfless" },
      { id: "LNq4xox99HY", start: 0, title: "Ode to the Mets", artist: "The Strokes", cover: "ode-to-the-mets" },
      { id: "o4qsjmLxhow", start: 0, title: "The Adults Are Talking", artist: "The Strokes", cover: "the-adults-are-talking" },
      { id: "dvgZkm1xWPE", start: 0, title: "Viva la Vida", artist: "Coldplay", cover: "viva-la-vida" },
      { id: "A_MjCqQoLLA", start: 0, title: "Hey Jude", artist: "The Beatles", cover: "hey-jude" },
      { id: "Cl6Rz1Uvi2M", start: 0, title: "Pull Me Out of This", artist: "Fred again..", cover: "pull-me-out-of-this" },
    ];
    var deckMode = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 64rem)").matches;
    var deck = null, needleSwing = null, driftTimer = 0;

    function playTrack(i) {
      deckSong = i;
      var t = TRACKS[i];
      wantPlay = true;
      if (!yt) loadYouTube(false, t.id, t.start);
      else if (ytReady) yt.loadVideoById({ videoId: t.id, startSeconds: t.start });
      if (deck) setPlaying(true);
    }
    // The needle swings onto the outer groove, then creeps inward as the song plays, like a real
    // tonearm. Paused, it lifts back to its rest.
    function moveNeedle(deg, secs, ease) {
      needleSwing.style.transition = "transform " + secs + "s " + ease;
      needleSwing.style.transform = "rotate(" + deg + "deg)";
    }
    function setPlaying(on) {
      deck.classList.toggle("playing", on);
      clearTimeout(driftTimer);
      if (on) {
        moveNeedle(-3, 1.1, "cubic-bezier(.3,.7,.2,1)");
        driftTimer = setTimeout(function () { moveNeedle(10, 240, "linear"); }, 1150);
      } else moveNeedle(-24, 1, "cubic-bezier(.3,.7,.2,1)");
    }

    if (deckMode) buildDeck();
    function buildDeck() {
      root.classList.add("deck-on");   // CSS hides the small record
      var C = 330, R0 = 196, R1 = 304, A0 = 70, A1 = 202, N = TRACKS.length, GAP = 1.1;
      function pt(r, d) { var a = d * Math.PI / 180; return [C + r * Math.cos(a), C + r * Math.sin(a)]; }
      function f(n) { return n.toFixed(1); }
      var clips = "", segs = "", ticks = "";
      TRACKS.forEach(function (t, i) {
        var a = A0 + (A1 - A0) * i / N + GAP / 2, b = A0 + (A1 - A0) * (i + 1) / N - GAP / 2, m = (a + b) / 2;
        var p0 = pt(R1, a), p1 = pt(R1, b), p2 = pt(R0, b), p3 = pt(R0, a), mid = pt((R0 + R1) / 2, m);
        var d = "M" + f(p0[0]) + "," + f(p0[1]) + " A" + R1 + "," + R1 + " 0 0 1 " + f(p1[0]) + "," + f(p1[1]) +
                " L" + f(p2[0]) + "," + f(p2[1]) + " A" + R0 + "," + R0 + " 0 0 0 " + f(p3[0]) + "," + f(p3[1]) + " Z";
        var dx = 12 * Math.cos(m * Math.PI / 180), dy = 12 * Math.sin(m * Math.PI / 180);
        clips += '<clipPath id="deck-c' + i + '"><path d="' + d + '"/></clipPath>';
        segs += '<g class="seg" data-i="' + i + '" role="button" tabindex="0" aria-label="play ' + t.title + ' by ' + t.artist + '" ' +
                'data-dx="' + f(dx) + '" data-dy="' + f(dy) + '">' +
                '<image href="' + BASE + 'images/covers/' + t.cover + '.webp" x="' + f(mid[0] - 70) + '" y="' + f(mid[1] - 70) + '" width="140" height="140" preserveAspectRatio="xMidYMid slice" clip-path="url(#deck-c' + i + ')"/>' +
                '<path class="rim" d="' + d + '"/></g>';
      });
      for (var k = 0; k <= 60; k++) {
        var ang = A0 + (A1 - A0) * k / 60, q0 = pt(R1 + 8, ang), q1 = pt(R1 + (k % 5 ? 12 : 17), ang);
        ticks += '<line x1="' + f(q0[0]) + '" y1="' + f(q0[1]) + '" x2="' + f(q1[0]) + '" y2="' + f(q1[1]) + '"/>';
      }
      deck = document.createElement("div");
      deck.className = "deck";
      deck.innerHTML =
        '<div class="deck-glass"></div>' +
        '<svg class="deck-dial" viewBox="0 0 660 660"><defs>' + clips + '</defs><g class="deck-rot"><g class="deck-ticks">' + ticks + '</g>' + segs + '</g></svg>' +
        '<button class="deck-record" type="button" aria-label="record player: hover to choose a song, click to pause or play">' +
          '<span class="deck-disc"><span class="deck-label"><i></i><span>SIDE A</span></span></span><span class="deck-sheen"></span></button>' +
        // Tonearm drawn from scratch: base, counterweight, pivot, curved arm, head with cartridge.
        '<svg class="deck-arm" viewBox="0 0 120 300" aria-hidden="true"><defs>' +
          '<linearGradient id="deck-metal" x1="0" x2="1"><stop offset="0" stop-color="#6f6c66"/><stop offset=".45" stop-color="#f4f2ec"/><stop offset=".6" stop-color="#d9d6cf"/><stop offset="1" stop-color="#5f5c57"/></linearGradient>' +
          '<radialGradient id="deck-plinth" cx=".4" cy=".35"><stop offset="0" stop-color="#3a3731"/><stop offset="1" stop-color="#14130f"/></radialGradient>' +
          '<filter id="deck-drop" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="6" dy="9" stdDeviation="3.5" flood-color="#000" flood-opacity=".55"/></filter></defs>' +
          '<circle cx="78" cy="30" r="24" fill="url(#deck-plinth)" stroke="#45423b"/><circle cx="78" cy="30" r="15" fill="#1d1b17" stroke="#5a5750"/>' +
          '<g class="deck-swing" filter="url(#deck-drop)">' +
            '<rect x="69" y="-22" width="18" height="24" rx="4" fill="url(#deck-metal)"/><rect x="69" y="-12" width="18" height="2" fill="rgba(0,0,0,.25)"/>' +
            '<rect x="75.5" y="0" width="5" height="22" fill="url(#deck-metal)"/>' +
            '<circle cx="78" cy="30" r="8.5" fill="url(#deck-metal)" stroke="#4c4a45" stroke-width=".8"/><circle cx="78" cy="30" r="2.6" fill="#3a3833"/>' +
            '<path d="M78 34 C79 90 84 140 80 186 C78 204 68 218 56 230" fill="none" stroke="#3b3934" stroke-width="5.6" stroke-linecap="round"/>' +
            '<path d="M78 34 C79 90 84 140 80 186 C78 204 68 218 56 230" fill="none" stroke="url(#deck-metal)" stroke-width="4" stroke-linecap="round"/>' +
            '<g transform="rotate(-38 52 236)"><rect x="40" y="229" width="25" height="14" rx="2" fill="url(#deck-metal)" stroke="#4c4a45" stroke-width=".6"/>' +
            '<rect x="44" y="241" width="15" height="7" rx="1" fill="#141311"/><rect x="62" y="232" width="10" height="2.4" rx="1.2" fill="url(#deck-metal)"/>' +
            '<rect x="50.5" y="247.5" width="2" height="3" fill="#c9c6bf"/></g></g></svg>' +
        '<div class="deck-readout" aria-live="polite"><div class="k"></div><div class="t"></div><div class="a"></div><div class="h">click to play</div></div>';
      document.body.appendChild(deck);
      needleSwing = deck.querySelector(".deck-swing");
      var rec = deck.querySelector(".deck-record"), sheen = deck.querySelector(".deck-sheen"), readout = deck.querySelector(".deck-readout");
      var rearm = true;

      // Hover the record: the dial opens and stays open until a song or the record is clicked.
      rec.addEventListener("mouseenter", function () { if (rearm) deck.classList.add("open"); });
      rec.addEventListener("mouseleave", function () { rearm = true; });
      rec.addEventListener("click", function () {
        if (deck.classList.contains("open")) { deck.classList.remove("open", "hovering"); rearm = false; return; }
        if (deckSong < 0) { deck.classList.add("open"); return; }   // nothing chosen yet: show the dial
        var on = !deck.classList.contains("playing");
        setPlaying(on);
        wantPlay = on;
        if (ytReady) { if (on) yt.playVideo(); else yt.pauseVideo(); }
      });
      function show(i) {
        readout.querySelector(".k").textContent = "NOW SELECTING · " + String(i + 1).padStart(2, "0");
        readout.querySelector(".t").textContent = TRACKS[i].title;
        readout.querySelector(".a").textContent = "by " + TRACKS[i].artist;
      }
      deck.querySelectorAll(".seg").forEach(function (s) {
        var i = +s.getAttribute("data-i");
        // Per-cover values (stagger delay, pop-out direction) are set here rather than in the
        // markup, because the site's security policy blocks inline style attributes.
        s.style.setProperty("--i", i);
        s.style.setProperty("--dx", s.getAttribute("data-dx") + "px");
        s.style.setProperty("--dy", s.getAttribute("data-dy") + "px");
        function choose() {
          deck.querySelectorAll(".seg").forEach(function (x) { x.classList.remove("sel"); });
          s.classList.add("sel");
          s.classList.remove("hot");
          deck.classList.remove("open", "hovering");   // everything tidies away...
          rearm = false;
          playTrack(i);                               // ...and the song plays
        }
        s.addEventListener("mouseenter", function () { deck.classList.add("hovering"); s.classList.add("hot"); show(i); });
        s.addEventListener("mouseleave", function () { s.classList.remove("hot"); deck.classList.remove("hovering"); });
        s.addEventListener("focus", function () { deck.classList.add("open", "hovering"); s.classList.add("hot"); show(i); });
        s.addEventListener("blur", function () { s.classList.remove("hot"); deck.classList.remove("hovering"); });
        s.addEventListener("click", choose);
        s.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(); } });
      });
      // The light on the grooves comes from the cursor's direction, so the reflection shifts as
      // you move, like real vinyl.
      var raf = 0, lx = 0, ly = 0;
      window.addEventListener("pointermove", function (e) {
        lx = e.clientX; ly = e.clientY;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          var r = rec.getBoundingClientRect();
          var a = Math.atan2(ly - (r.top + r.height / 2), lx - (r.left + r.width / 2)) * 180 / Math.PI;
          sheen.style.setProperty("--la", (a + 180).toFixed(1) + "deg");
        });
      }, { passive: true });
    }

    // The top bar's backdrop shows only once the page has scrolled (see .scrolled in styles.css).
    function onScroll() { root.classList.toggle("scrolled", window.scrollY > 4); }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // ---- moving between pages without stopping the music ----
    // A normal link click loads a whole new page, which throws away the hidden YouTube player.
    // Instead, for links to our own pages, we fetch the new page in the background, swap in its
    // name mark and <main> content, and update the address bar (history.pushState). The top bar,
    // the letter field and the player are never reloaded, so the song keeps going.
    // If anything goes wrong, we fall back to a normal page load.
    var shown = location.pathname;
    function go(href, push) {
      fetch(href).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      }).then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var main = doc.querySelector("main"), logo = doc.querySelector(".logo");
        if (!main) throw new Error("no main");
        // Change the address first, so the new page's relative links and images resolve from it.
        if (push) history.pushState(null, "", href);
        shown = location.pathname;
        document.title = doc.title;
        document.querySelector("main").replaceWith(document.adoptNode(main));
        var oldLogo = document.querySelector(".logo");
        if (logo && oldLogo) oldLogo.replaceWith(document.adoptNode(logo));
        window.scrollTo(0, 0);
        onScroll();
        document.dispatchEvent(new Event("page:load"));   // script.js and field.js listen for this
      }).catch(function () { location.href = href; });
    }
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest("a");
      if (!a || a.target || a.hasAttribute("download") || a.protocol.indexOf("http") !== 0) return;
      if (a.origin !== location.origin || !/(\/|\.html)$/.test(a.pathname)) return;   // only our own pages
      if (a.pathname === location.pathname && a.hash) return;                         // same-page #jump
      e.preventDefault();
      if (a.pathname !== location.pathname) go(a.href, true);
    });
    // Back and forward buttons.
    window.addEventListener("popstate", function () {
      if (location.pathname !== shown) go(location.href, false);
    });

    // If the device setting changes and you haven't chosen yourself, follow it.
    media.addEventListener("change", render);
  });
})();
