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
  // With no saved choice the site starts in dark mode (a design choice), whatever the device says.
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
    // Songs are our own files in audio/ (NAME.mp3), played by the browser's built-in audio player:
    // no ads and nothing from other sites. A song only downloads when it is played.
    // Side A: "all over the place". Spread out so the same artist never sits next to itself.
    // start: where the song begins, in seconds. cover: images/covers/NAME.webp; the audio file has
    // the same name unless "file" says otherwise. fx, fy: the point of the cover to keep in view
    // inside its small slice in the dial (0 to 1 across, down).
    var TRACKS = [
      { start: 28, title: "Memory Box", artist: "Peter Cat Recording Co.", cover: "memory-box", fx: .22, fy: .45 },
      { start: 0, title: "Don't Look Back in Anger", artist: "Oasis", cover: "dont-look-back-in-anger", fx: .53, fy: .62 },
      { start: 0, title: "Selfless", artist: "The Strokes", cover: "selfless", fx: .3, fy: .3 },
      { start: 0, title: "Sweet Caroline", artist: "Neil Diamond", cover: "sweet-caroline", fx: .48, fy: .42 },
      { start: 0, title: "Bohemian Rhapsody", artist: "Queen", cover: "bohemian-rhapsody", fx: .5, fy: .38 },
      { start: 0, title: "Control Room", artist: "Peter Cat Recording Co.", cover: "control-room", fx: .52, fy: .48 },
      { start: 0, title: "Theme from New York, New York", artist: "Frank Sinatra", cover: "new-york-new-york", fx: .33, fy: .32 },
      { start: 0, title: "Ode to the Mets", artist: "The Strokes", cover: "ode-to-the-mets", fx: .62, fy: .58 },
      { start: 0, title: "Ain't No Sunshine", artist: "Bill Withers", cover: "lean-on-me", file: "aint-no-sunshine", fx: .3, fy: .42 },
      { start: 0, title: "Vienna", artist: "Billy Joel", cover: "vienna", fx: .55, fy: .6 },
      { start: 110, title: "Clown on the 22nd Floor + Happiness", artist: "Peter Cat Recording Co.", cover: "portrait-of-a-time", fx: .45, fy: .55 },
      { start: 0, title: "Hey Jude", artist: "The Beatles", cover: "hey-jude", fx: .7, fy: .42 },
      { start: 0, title: "The Adults Are Talking", artist: "The Strokes", cover: "the-adults-are-talking", fx: .82, fy: .4 },
      { start: 0, title: "Tennessee Whiskey", artist: "Chris Stapleton", cover: "tennessee-whiskey", fx: .5, fy: .5 },
      { start: 0, title: "Pull Me Out of This", artist: "Fred again..", cover: "pull-me-out-of-this", fx: .45, fy: .45 },
    ];

    var audio = new Audio();
    audio.preload = "none";
    function fileOf(t) { return BASE + "audio/" + (t.file || t.cover) + ".mp3"; }

    // Engraved-style record drawn from scratch: many thin grooves, a light band, a label, a hole.
    var grooves = "";
    for (var r = 18; r > 8.5; r -= 0.8) grooves += '<circle class="groove" cx="20" cy="20" r="' + r.toFixed(1) + '"/>';
    var player = document.createElement("button");
    player.className = "vinyl";
    player.type = "button";
    player.setAttribute("aria-label", "play a song i like");
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

    var deckSong = -1;   // which song from TRACKS is loaded (-1: none yet)
    // Phones and tablets: tap the small record to open the record sheet (built below).
    player.addEventListener("click", function () { if (sheet) toggleSheet(); });

    // ---- the record deck (desktop only) ----
    // On computers with a mouse, the small record is swapped for a big, realistic one in the top
    // right. Hovering it fans out a dial of album covers; clicking a cover plays that song straight
    // away (the dial closes and the needle drops). Clicking the record pauses or resumes.
    // Phones and tablets keep the small record above, unchanged.
    // Side A: "all over the place". Spread out so the same artist never sits next to itself.
    // fx, fy: the point of the cover to keep in view inside its small slice (0 to 1 across, down).
    var deckMode = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 64rem)").matches;
    var deck = null, needleSwing = null, driftTimer = 0, toggleBtn = null, toast = null, toastTimer = 0;
    // The playing song's cover keeps a bright rim in the dial, so reopening it shows what's on.
    function markNow(i) {
      deck.classList.add("has-now");
      deck.querySelectorAll(".seg").forEach(function (x) { x.classList.toggle("sel", +x.getAttribute("data-i") === i); });
      if (!deck.classList.contains("hovering")) showNow();
    }
    // A small "now playing" card under the record each time the song changes, fading after a few seconds.
    function announce(i) {
      toast.querySelector(".t").textContent = TRACKS[i].title;
      toast.querySelector(".a").textContent = "by " + TRACKS[i].artist;
      toast.classList.remove("show");
      void toast.offsetWidth;   // restart the fade-in
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 4000);
    }
    var showNow = function () {};

    // Shuffle like the photos: every song plays once (in random order) before any repeats.
    var bag = [];
    function nextShuffled() {
      if (!bag.length) {
        bag = TRACKS.map(function (_, i) { return i; }).filter(function (i) { return i !== deckSong; });
        for (var k = bag.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)), x = bag[k]; bag[k] = bag[j]; bag[j] = x; }
      }
      return bag.pop();
    }
    // The little play/pause key appears only once sound has actually started.
    audio.addEventListener("playing", function () { if (deck || sheet) root.classList.add("deck-played"); });
    // When a song ends, shuffle on to the next one.
    audio.addEventListener("ended", function () { playTrack(nextShuffled()); });
    function playTrack(i) {
      bag = bag.filter(function (x) { return x !== i; });
      if (deck) { markNow(i); announce(i); }
      deckSong = i;
      if (sheet) sheetShow(i);
      var t = TRACKS[i];
      audio.src = fileOf(t) + (t.start ? "#t=" + t.start : "");   // #t= starts the file partway in
      audio.play().catch(function () { if (deck) setPlaying(false); if (sheet) sheetPlaying(false); });
      if (deck) setPlaying(true);
      if (sheet) sheetPlaying(true);
    }
    // The needle swings onto the outer groove, then creeps inward as the song plays, like a real
    // tonearm. Paused, it lifts back to its rest.
    function moveNeedle(deg, secs, ease) {
      needleSwing.style.transition = "transform " + secs + "s " + ease;
      needleSwing.style.transform = "rotate(" + deg + "deg)";
    }
    function setPlaying(on) {
      deck.classList.toggle("playing", on);
      if (!deck.classList.contains("hovering")) showNow();
      if (toggleBtn) {
        toggleBtn.setAttribute("aria-pressed", on ? "true" : "false");
        toggleBtn.setAttribute("aria-label", on ? "pause" : "play");
      }
      clearTimeout(driftTimer);
      if (on) {
        moveNeedle(-3, 1.1, "cubic-bezier(.3,.7,.2,1)");
        driftTimer = setTimeout(function () { moveNeedle(10, 240, "linear"); }, 1150);
      } else moveNeedle(-24, 1, "cubic-bezier(.3,.7,.2,1)");
    }

    // ---- the record sheet (phones and tablets) ----
    // The desktop deck doesn't fit a phone, so the same record and covers live in a sheet that
    // slides up from the bottom: the big vinyl with its cream label, the now-playing card in the
    // deck's type, and a row of covers to swipe. Tap a cover to play it; tap the record to pause or
    // play. Swipe the sheet down, tap the page above it, or tap the small record to close.
    var sheet = null, sheetShow = function () {}, sheetPlaying = function () {}, toggleSheet = function () {};
    if (!deckMode) buildSheet();
    function buildSheet() {
      var covers = TRACKS.map(function (t, i) {
        return '<button class="sheet-cover" type="button" data-i="' + i + '" aria-label="play ' + t.title + ' by ' + t.artist + '">' +
          '<img src="' + BASE + 'images/covers/' + t.cover + '.webp" alt="" width="84" height="84" loading="lazy" decoding="async"></button>';
      }).join("");
      var scrim = document.createElement("div");
      scrim.className = "sheet-scrim";
      sheet = document.createElement("div");
      sheet.className = "sheet";
      sheet.setAttribute("role", "dialog");
      sheet.setAttribute("aria-label", "record player");
      sheet.setAttribute("aria-hidden", "true");
      sheet.innerHTML =
        '<div class="sheet-grab" aria-hidden="true"></div>' +
        '<div class="sheet-top">' +
          '<button class="sheet-record" type="button" aria-label="play"><span class="deck-disc"><span class="deck-label"><i></i></span></span><span class="deck-sheen"></span></button>' +
          '<div class="sheet-now" aria-live="polite"><div class="k">SIDE A · 15 SONGS</div><div class="t">all over the place</div><div class="a">pick a record below</div></div>' +
        '</div>' +
        '<div class="sheet-row">' + covers + '</div>' +
        '<div class="sheet-hint">swipe · tap a cover to play</div>';
      document.body.appendChild(scrim);
      document.body.appendChild(sheet);
      var rec = sheet.querySelector(".sheet-record"), now = sheet.querySelector(".sheet-now"), row = sheet.querySelector(".sheet-row");

      var locked = false, lockY = 0;
      function setOpen(on) {
        sheet.classList.toggle("open", on);
        root.classList.toggle("sheet-open", on);
        sheet.setAttribute("aria-hidden", on ? "false" : "true");
        player.setAttribute("aria-expanded", on ? "true" : "false");
        sheet.style.transform = "";
        // Lock the page in place while the sheet is open (the reliable way on iPhone), and put it
        // back exactly where it was when the sheet closes.
        if (on && !locked) {
          lockY = window.scrollY; locked = true;
          document.body.style.top = -lockY + "px";
          root.classList.add("sheet-lock");
        } else if (!on && locked) {
          locked = false;
          root.classList.remove("sheet-lock");
          document.body.style.top = "";
          window.scrollTo(0, lockY);
        }
        if (on) {
          var sel = row.querySelector(".sel");
          if (sel) row.scrollLeft = sel.offsetLeft - (row.clientWidth - sel.offsetWidth) / 2;
          rec.focus({ preventScroll: true });
        }
      }
      toggleSheet = function () { setOpen(!sheet.classList.contains("open")); };
      player.setAttribute("aria-label", "record player: choose a song");
      player.setAttribute("aria-expanded", "false");

      sheetShow = function (i) {
        row.querySelectorAll(".sheet-cover").forEach(function (b) { b.classList.toggle("sel", +b.getAttribute("data-i") === i); });
        sheet.classList.add("has-now");
        now.querySelector(".t").textContent = TRACKS[i].title;
        now.querySelector(".a").textContent = "by " + TRACKS[i].artist;
      };
      sheetPlaying = function (on) {
        sheet.classList.toggle("playing", on);
        player.setAttribute("aria-pressed", on ? "true" : "false");   // the small record spins too
        rec.setAttribute("aria-label", on ? "pause" : "play");
        if (deckSong >= 0) now.querySelector(".k").textContent = (on ? "NOW PLAYING" : "PAUSED") + " · " + String(deckSong + 1).padStart(2, "0") + " / " + TRACKS.length;
      };
      rec.addEventListener("click", function () {
        if (deckSong < 0) { playTrack(nextShuffled()); return; }   // nothing chosen yet: shuffle
        var on = !sheet.classList.contains("playing");
        sheetPlaying(on);
        if (on) audio.play().catch(function () { sheetPlaying(false); }); else audio.pause();
      });
      row.addEventListener("click", function (e) {
        var b = e.target.closest(".sheet-cover");
        if (b) playTrack(+b.getAttribute("data-i"));
      });
      scrim.addEventListener("click", function () { setOpen(false); });
      // With the sheet closed, a small play/pause key beside the record (as on desktop), shown once
      // a song has actually started, so pausing doesn't need the sheet.
      var key = document.createElement("button");
      key.className = "deck-toggle sheet-toggle";
      key.type = "button";
      key.setAttribute("aria-label", "play");
      key.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
        '<path class="i-play" d="M7.2 5.6 L14.6 10 L7.2 14.4 Z"/><g class="i-pause"><rect x="6.4" y="5.6" width="2.6" height="8.8" rx=".6"/><rect x="11" y="5.6" width="2.6" height="8.8" rx=".6"/></g></svg>';
      key.addEventListener("click", function () { rec.click(); });
      document.body.appendChild(key);
      var setKey = sheetPlaying;
      sheetPlaying = function (on) {
        setKey(on);
        key.setAttribute("aria-pressed", on ? "true" : "false");
        key.setAttribute("aria-label", on ? "pause" : "play");
      };
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && sheet.classList.contains("open")) { setOpen(false); player.focus(); } });

      // Drag the sheet down to close it (from anywhere but the cover row, which scrolls sideways).
      // Drag the sheet down to close it. iPhone Safari reloads the page if a downward drag reaches
      // the page, so while the sheet is open every vertical drag is kept here: the page underneath
      // is locked in place, and only sideways swipes on the cover row are left to scroll.
      var x0 = 0, y0 = null, dy = 0, axis = "";
      sheet.addEventListener("touchstart", function (e) {
        x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; dy = 0; axis = "";
      }, { passive: true });
      document.addEventListener("touchmove", function (e) {
        if (!sheet.classList.contains("open")) return;
        if (!sheet.contains(e.target)) { e.preventDefault(); return; }   // the dimmed page above
        if (y0 === null) return;
        var mx = e.touches[0].clientX - x0, my = e.touches[0].clientY - y0;
        if (!axis && (Math.abs(mx) > 6 || Math.abs(my) > 6)) {
          axis = Math.abs(mx) > Math.abs(my) && e.target.closest(".sheet-row") ? "x" : "y";
          if (axis === "y") sheet.classList.add("dragging");
        }
        if (axis === "x") return;   // the cover row scrolls sideways on its own
        e.preventDefault();
        dy = Math.max(0, my);
        sheet.style.transform = "translateY(" + dy + "px)";
      }, { passive: false });
      sheet.addEventListener("touchend", function () {
        if (y0 === null) return;
        y0 = null; sheet.classList.remove("dragging");
        if (axis === "y" && dy > 70) setOpen(false); else sheet.style.transform = "";
      });
    }

    if (deckMode) buildDeck();
    function buildDeck() {
      root.classList.add("deck-on");   // CSS hides the small record
      var C = 330, R0 = 186, R1 = 318, N = TRACKS.length, GAP = 1;
      // The dial runs from the right edge of the window to the top edge. The record's centre sits
      // 150px from the right and 130px from the top, and the deck is scaled by s (same formula
      // as setScale below), so the edge angles depend on the window width.
      var sc = Math.min(1.05, Math.max(0.62, window.innerWidth / 1440 * 0.62 + 0.38));
      var e0 = Math.acos(Math.min(1, 150 / (sc * R1))) * 180 / Math.PI;          // angle where the right edge cuts the dial
      var e1 = 180 + Math.asin(Math.min(1, 130 / (sc * R1))) * 180 / Math.PI;   // angle where the top edge cuts it
      // The two end covers run past the edges, so each shows most of itself with a slice cut off
      // by the edge of the window, as if the dial carries on beyond the screen.
      var slot = (e1 - e0) / (N - 0.8);
      var A0 = e0 - slot * 0.4, A1 = e1 + slot * 0.4;   // runs off the top and right edges, so the dial reaches the corner
      function pt(r, d) { var a = d * Math.PI / 180; return [C + r * Math.cos(a), C + r * Math.sin(a)]; }
      function f(n) { return n.toFixed(1); }
      var clips = "", segs = "", ticks = "";
      TRACKS.forEach(function (t, i) {
        var a = A0 + (A1 - A0) * i / N + GAP / 2, b = A0 + (A1 - A0) * (i + 1) / N - GAP / 2, m = (a + b) / 2;
        var p0 = pt(R1, a), p1 = pt(R1, b), p2 = pt(R0, b), p3 = pt(R0, a), mid = pt((R0 + R1) / 2, m);
        var d = "M" + f(p0[0]) + "," + f(p0[1]) + " A" + R1 + "," + R1 + " 0 0 1 " + f(p1[0]) + "," + f(p1[1]) +
                " L" + f(p2[0]) + "," + f(p2[1]) + " A" + R0 + "," + R0 + " 0 0 0 " + f(p3[0]) + "," + f(p3[1]) + " Z";
        var dx = 12 * Math.cos(m * Math.PI / 180), dy = 12 * Math.sin(m * Math.PI / 180);
        // Place the cover so its focus point sits in the slice, but never so far that the slice
        // runs past the picture's edge (no empty corners): clamp to the slice's bounding box.
        var xs = [p0[0], p1[0], p2[0], p3[0], pt(R1, m)[0]], ys = [p0[1], p1[1], p2[1], p3[1], pt(R1, m)[1]];
        var bx0 = Math.min.apply(0, xs), bx1 = Math.max.apply(0, xs), by0 = Math.min.apply(0, ys), by1 = Math.max.apply(0, ys);
        var SIZE = Math.ceil(Math.max(170, bx1 - bx0 + 4, by1 - by0 + 4));
        var img = [Math.min(bx0 - 2, Math.max(bx1 + 2 - SIZE, mid[0] - t.fx * SIZE)),
                   Math.min(by0 - 2, Math.max(by1 + 2 - SIZE, mid[1] - t.fy * SIZE))];
        clips += '<clipPath id="deck-c' + i + '"><path d="' + d + '"/></clipPath>';
        segs += '<g class="seg" data-i="' + i + '" role="button" tabindex="0" aria-label="play ' + t.title + ' by ' + t.artist + '" ' +
                'data-dx="' + f(dx) + '" data-dy="' + f(dy) + '">' +
                '<image href="' + BASE + 'images/covers/' + t.cover + '.webp" x="' + f(img[0]) + '" y="' + f(img[1]) + '" width="' + SIZE + '" height="' + SIZE + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#deck-c' + i + ')"/>' +
                '<path class="rim" d="' + d + '"/></g>';
      });
      for (var k = 0; k <= 60; k++) {
        var ang = A0 + (A1 - A0) * k / 60, q0 = pt(R1 + 8, ang), q1 = pt(R1 + (k % 5 ? 12 : 17), ang);
        ticks += '<line x1="' + f(q0[0]) + '" y1="' + f(q0[1]) + '" x2="' + f(q1[0]) + '" y2="' + f(q1[1]) + '"/>';
      }
      deck = document.createElement("div");
      deck.className = "deck";
      // The deck's scale, from the window width. Done here rather than in CSS because older
      // Safari can't work out "100vw / 1440px", which left the deck stuck at full size.
      function setScale() { deck.style.setProperty("--s", Math.min(1.05, Math.max(0.62, window.innerWidth / 1440 * 0.62 + 0.38)).toFixed(4)); }
      setScale();
      window.addEventListener("resize", setScale);
      deck.innerHTML =
        '<div class="deck-plinth" aria-hidden="true"><i></i><b class="sc s1"></b><b class="sc s2"></b><b class="sc s3"></b><b class="sc s4"></b><u class="knob"></u><u class="led"></u></div>' +   // turntable base, dark mode only (see styles.css)
        '<div class="deck-glass"></div>' +
        '<svg class="deck-dial" viewBox="0 0 660 660"><defs>' + clips + '</defs><g class="deck-rot"><g class="deck-ticks">' + ticks + '</g>' + segs + '</g></svg>' +
        '<button class="deck-record" type="button" aria-label="record player: hover to choose a song, click to pause or play">' +
          '<span class="deck-disc"><span class="deck-label"><i></i><b>ALL OVER THE PLACE</b><span>SIDE A</span></span></span><span class="deck-sheen"></span></button>' +
        // Tonearm drawn from scratch: base, counterweight, pivot, curved arm, head with cartridge.
        '<svg class="deck-arm" viewBox="0 0 120 300" aria-hidden="true"><defs>' +
          '<linearGradient id="deck-metal" x1="0" x2="1"><stop offset="0" stop-color="#6f6c66"/><stop offset=".45" stop-color="#f4f2ec"/><stop offset=".6" stop-color="#d9d6cf"/><stop offset="1" stop-color="#5f5c57"/></linearGradient>' +
          '<radialGradient id="deck-plinth" cx=".4" cy=".35"><stop offset="0" stop-color="#3a3731"/><stop offset="1" stop-color="#14130f"/></radialGradient>' +
          '<filter id="deck-drop" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="4" dy="6" stdDeviation="3" flood-color="#000" flood-opacity=".3"/></filter></defs>' +
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
      var rearm = true, closeTimer = 0;

      // Hover the record: the dial opens. It stays open while the pointer is on the record or the
      // dial, and closes a moment after the pointer leaves both.
      function stayOpen() { clearTimeout(closeTimer); }
      function closeSoon() { clearTimeout(closeTimer); closeTimer = setTimeout(function () { deck.classList.remove("open", "hovering"); }, 280); }
      // Only the record itself opens the dial, after a short pause, so moving the pointer past it
      // (for example down to the start/stop key) doesn't pop the dial open.
      var openTimer = 0;
      function hoverIn() {
        stayOpen();
        if (!rearm) return;
        if (deck.classList.contains("open")) { showNow(); return; }
        openTimer = setTimeout(function () { deck.classList.add("open"); showNow(); }, 220);
      }
      // The whole turntable (record and base) opens the dial.
      var base = deck.querySelector(".deck-plinth");
      [rec, base].forEach(function (el) {
        el.addEventListener("mouseenter", hoverIn);
        el.addEventListener("mouseleave", function () { clearTimeout(openTimer); rearm = true; closeSoon(); });
      });
      var glass = deck.querySelector(".deck-glass");   // the frosted ring between and behind the covers
      glass.addEventListener("mouseenter", stayOpen);
      glass.addEventListener("mouseleave", closeSoon);
      function togglePlay() {
        var on = !deck.classList.contains("playing");
        setPlaying(on);
        if (on) audio.play().catch(function () { setPlaying(false); }); else audio.pause();
      }
      rec.addEventListener("click", function () {
        if (deck.classList.contains("open")) { deck.classList.remove("open", "hovering"); rearm = false; return; }
        if (deckSong < 0) { deck.classList.add("open"); return; }   // nothing chosen yet: show the dial
        togglePlay();
      });
      // Clicking the record pauses and resumes (the dial opens only after a short hover).
      // The small round play/pause button, just left of the turntable, shown once a song is
      // actually playing. The easy way to stop, since hovering the record opens the dial.
      toggleBtn = document.createElement("button");
      toggleBtn.className = "deck-toggle";
      toggleBtn.type = "button";
      toggleBtn.setAttribute("aria-pressed", "false");
      toggleBtn.setAttribute("aria-label", "play");
      toggleBtn.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
        '<path class="i-play" d="M7.2 5.6 L14.6 10 L7.2 14.4 Z"/><g class="i-pause"><rect x="6.4" y="5.6" width="2.6" height="8.8" rx=".6"/><rect x="11" y="5.6" width="2.6" height="8.8" rx=".6"/></g></svg>';
      toggleBtn.addEventListener("click", togglePlay);
      var plinth = deck.querySelector(".deck-plinth");
      function placeToggle() {
        if (deck.classList.contains("open")) return;
        var r = plinth.getBoundingClientRect();
        toggleBtn.style.left = Math.round(r.left - 38) + "px";
        toggleBtn.style.top = Math.round(r.top + r.height / 2 - 13) + "px";
      }
      setTimeout(placeToggle, 700);
      window.addEventListener("resize", function () { setTimeout(placeToggle, 700); });
      deck.addEventListener("transitionend", placeToggle);
      document.body.appendChild(toggleBtn);
      // Mirror the dial's open state on <html>, so the play/pause key and the card can step aside.
      new MutationObserver(function () { root.classList.toggle("deck-open", deck.classList.contains("open")); })
        .observe(deck, { attributes: true, attributeFilter: ["class"] });
      toast = document.createElement("div");
      toast.className = "deck-toast";
      toast.setAttribute("role", "status");
      toast.innerHTML = '<div class="k">NOW PLAYING</div><div class="t"></div><div class="a"></div>';
      document.body.appendChild(toast);
      function show(i, label) {
        readout.querySelector(".k").textContent = (label || "NOW SELECTING") + " · " + String(i + 1).padStart(2, "0");
        readout.querySelector(".t").textContent = TRACKS[i].title;
        readout.querySelector(".a").textContent = "by " + TRACKS[i].artist;
      }
      // With the dial open and nothing hovered, the card shows the song that's playing.
      showNow = function () {
        if (deckSong < 0) return;
        show(deckSong, deck.classList.contains("playing") ? "NOW PLAYING" : "PAUSED");
        readout.querySelector(".h").textContent = "pick another to switch";
      };
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
          rearm = true;   // the record shrinks away from the pointer, so hovering it again reopens the dial
          playTrack(i);                               // ...and the song plays
        }
        s.addEventListener("mouseenter", function () { stayOpen(); deck.classList.add("hovering"); s.classList.add("hot"); show(i); readout.querySelector(".h").textContent = "click to play"; });
        s.addEventListener("mouseleave", function () { s.classList.remove("hot"); deck.classList.remove("hovering"); showNow(); closeSoon(); });
        s.addEventListener("focus", function () { deck.classList.add("open", "hovering"); s.classList.add("hot"); show(i); });
        s.addEventListener("blur", function () { s.classList.remove("hot"); deck.classList.remove("hovering"); });
        s.addEventListener("click", choose);
        s.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(); } });
      });
      // While the record plays, the light on the grooves comes from the cursor's direction, so the
      // reflection shifts as you move, like real vinyl. Stopped, it stays still.
      var raf = 0, lx = 0, ly = 0;
      window.addEventListener("pointermove", function (e) {
        lx = e.clientX; ly = e.clientY;
        if (raf || !deck.classList.contains("playing")) return;
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

    // ---- link previews ----
    // Hovering a link shows a small screenshot of where it goes, in a card that glides after the
    // cursor and leans a little as it moves. Screenshots live in images/previews/ (taken by
    // scripts/capture_previews.cjs); images/previews/index.json lists which links have one.
    // Mouse only: phones and tablets have no hover.
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) (function () {
      var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var have = null;   // names with a screenshot, loaded on the first hover
      var card = document.createElement("div");
      card.className = "link-preview";
      card.setAttribute("aria-hidden", "true");
      var img = document.createElement("img");
      img.alt = "";
      card.appendChild(img);
      document.body.appendChild(card);
      var pos = { x: 0, y: 0 }, target = { x: 0, y: 0 }, tilt = 0, current = null, showTimer = 0, frame = 0, last = 0;
      // Same rule as the capture script: host + path, lowercase, with runs of other characters as "-".
      function previewName(u) {
        return (u.hostname.replace(/^www\./, "") + u.pathname).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
      }
      function nameFor(a) {
        var href = a.getAttribute("href");
        if (!href || /^(mailto:|#)/.test(href)) return null;
        var u = new URL(href, location.href);
        // Our own pages are captured under the live address, wherever the site is running.
        if (u.origin === location.origin) u = new URL(u.pathname.replace(new URL(BASE).pathname, "/"), "https://shravanlad.com");
        var n = previewName(u);
        return have && have.indexOf(n) >= 0 ? n : null;
      }
      function place(e) {
        // Below and to the right of the cursor, flipped to the other side near the window's edges.
        var w = 240, h = 150, gap = 18;
        target.x = e.clientX + gap + w > innerWidth ? e.clientX - gap - w : e.clientX + gap;
        target.y = e.clientY + gap + h > innerHeight ? e.clientY - gap - h : e.clientY + gap;
      }
      function step(t) {
        var dt = Math.min(0.1, (t - (last || t)) / 1000); last = t;
        var k = still ? 1 : 1 - Math.exp(-dt * 14);   // a soft spring toward the target
        var dx = (target.x - pos.x) * k;
        pos.x += dx; pos.y += (target.y - pos.y) * k;
        tilt += (Math.max(-6, Math.min(6, dx * 0.6)) - tilt) * (1 - Math.exp(-dt * 10));   // lean into the motion
        card.style.setProperty("--x", pos.x.toFixed(1) + "px");
        card.style.setProperty("--y", pos.y.toFixed(1) + "px");
        card.style.setProperty("--tilt", (still ? 0 : tilt).toFixed(2) + "deg");
        frame = current ? requestAnimationFrame(step) : 0;
        if (!current) last = 0;
      }
      function show(a, e) {
        var n = nameFor(a);
        if (!n) return;
        current = a;
        img.src = BASE + "images/previews/" + n + ".webp";
        place(e); pos.x = target.x; pos.y = target.y; tilt = 0;   // appear at the cursor, then follow
        clearTimeout(showTimer);
        showTimer = setTimeout(function () { if (current === a) card.classList.add("show"); }, 120);
        if (!frame) frame = requestAnimationFrame(step);
      }
      function hide() {
        current = null;
        clearTimeout(showTimer);
        card.classList.remove("show");
      }
      document.addEventListener("pointerover", function (e) {
        if (e.pointerType !== "mouse") return;
        var a = e.target.closest && e.target.closest("a[href]");
        if (!a || a === current || a.classList.contains("logo")) return;   // the name mark just goes home
        if (have) { show(a, e); return; }
        if (have === null) {
          have = false;   // loading
          fetch(BASE + "images/previews/index.json").then(function (r) { return r.ok ? r.json() : []; })
            .catch(function () { return []; })
            .then(function (list) { have = list; if (a.matches(":hover")) show(a, e); });
        }
      });
      document.addEventListener("pointerout", function (e) {
        if (!current) return;
        var to = e.relatedTarget;
        if (!to || !current.contains(to)) hide();
      });
      document.addEventListener("pointermove", function (e) { if (current) place(e); }, { passive: true });
      document.addEventListener("page:load", hide);   // the link is gone after a page swap
      document.addEventListener("click", hide);
      window.addEventListener("blur", hide);
    })();

    // ---- moving between pages without stopping the music ----
    // A normal link click loads a whole new page, which throws away the audio player.
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
