// Hero image rotation.
// To add photos: put the files in images/hero/ and add their names to the list below.
// (Later, the build script will make this list automatically from the folder.)
const HERO_IMAGES = [
  "images/hero/408866-natsamrat9.jpg",
  "images/hero/651538914-18003763976893575-816255035336.jpg",
  "images/hero/a3116366373-16.jpg",
  "images/hero/ab67616d0000b27319497200ef054bccfab27d0c.jpg",
  "images/hero/afre-bnr24.jpg",
  "images/hero/beautifully-carved-idol-god-vitthal-temp.jpg",
  "images/hero/chhatrapati-shivaji-maharaj-silhouette-7.jpg",
  "images/hero/classicu-2024-05-26-164754-130-2.jpg",
  "images/hero/classicu-2024-06-12-171241-154.jpg",
  "images/hero/entering-in-dwaraka-scaled.jpg",
  "images/hero/esplanade-activies.jpg",
  "images/hero/harvey-mike.jpg",
  "images/hero/images.jpg",
  "images/hero/liam-noel-gallagher-oasis.jpg",
  "images/hero/michelangelo-creation-of-adam-cropped.jpg",
  "images/hero/mv5bmtvhotziztmty2uzns00mmfmltg0mgqtymy5.jpg",
  "images/hero/opwzd1y86ropvxlj.jpg",
  "images/hero/partha-sarathi-scaled.jpg",
  "images/hero/pcrc-beta-png2.jpg",
  "images/hero/queen-wallpaper-1920x1080.jpg",
  "images/hero/s-vfh-shawshank-redemption-20th-annivers.jpg",
  "images/hero/shutterisland.jpg",
  "images/hero/sisyphus-jeffrey-hummel.jpg",
  "images/hero/the-choice-scaled.jpg",
  "images/hero/thequint-2021-07-164cebd4-b9ef-4dda-af8b.jpg",
  "images/hero/tsunami-by-hokusai-19th-century.jpg",
  "images/hero/tumbbad.jpg",
  "images/hero/view-from-ad-white-house-hill-1930-rmc20.jpg",
];

// How each photo is framed in the wide frame: [x, y, zoom].
//  x and y: the point of the photo to keep in view, as a percentage (50, 50 is the middle;
//  0 is the left or top edge, 100 the right or bottom edge).
//  zoom: 1 shows the whole width; 1.3 zooms in 30% around that point.
// A photo that is not listed here is simply centered.
const FOCUS = {
  "images/hero/408866-natsamrat9.jpg": [50, 10, 1],
  "images/hero/651538914-18003763976893575-816255035336.jpg": [50, 58, 1],
  "images/hero/a3116366373-16.jpg": [50, 45, 1],
  "images/hero/ab67616d0000b27319497200ef054bccfab27d0c.jpg": [50, 20, 1],
  "images/hero/afre-bnr24.jpg": [50, 50, 1],
  "images/hero/beautifully-carved-idol-god-vitthal-temp.jpg": [50, 40, 1],
  "images/hero/chhatrapati-shivaji-maharaj-silhouette-7.jpg": [45, 42, 1.2],
  "images/hero/classicu-2024-05-26-164754-130-2.jpg": [45, 65, 1.1],
  "images/hero/classicu-2024-06-12-171241-154.jpg": [70, 68, 1.4],
  "images/hero/entering-in-dwaraka-scaled.jpg": [50, 50, 1.22],
  "images/hero/esplanade-activies.jpg": [50, 55, 1],
  "images/hero/harvey-mike.jpg": [50, 0, 1],
  "images/hero/images.jpg": [50, 40, 1],
  "images/hero/liam-noel-gallagher-oasis.jpg": [50, 8, 1],
  "images/hero/michelangelo-creation-of-adam-cropped.jpg": [45, 50, 1],
  "images/hero/mv5bmtvhotziztmty2uzns00mmfmltg0mgqtymy5.jpg": [52, 60, 1.25],
  "images/hero/opwzd1y86ropvxlj.jpg": [50, 45, 1],
  "images/hero/partha-sarathi-scaled.jpg": [45, 52, 1.15],
  "images/hero/pcrc-beta-png2.jpg": [50, 15, 1],
  "images/hero/queen-wallpaper-1920x1080.jpg": [50, 20, 1],
  "images/hero/s-vfh-shawshank-redemption-20th-annivers.jpg": [50, 30, 1],
  "images/hero/shutterisland.jpg": [50, 50, 1],
  "images/hero/sisyphus-jeffrey-hummel.jpg": [50, 38, 1],
  "images/hero/the-choice-scaled.jpg": [50, 35, 1.22],
  "images/hero/thequint-2021-07-164cebd4-b9ef-4dda-af8b.jpg": [50, 20, 1],
  "images/hero/tsunami-by-hokusai-19th-century.jpg": [50, 45, 1],
  "images/hero/tumbbad.jpg": [50, 75, 1.3],
  "images/hero/view-from-ad-white-house-hill-1930-rmc20.jpg": [55, 35, 1],
};

const SECONDS = 1; // seconds each photo stays (use 0.5 for two photos per second)

// Show a photo in the frame, using its framing from the FOCUS list.
function applyPhoto(img, src) {
  const [x, y, zoom] = FOCUS[src] || [50, 50, 1];
  img.style.objectPosition = x + "% " + y + "%";   // which part of the photo stays in view
  img.style.transformOrigin = x + "% " + y + "%";  // zoom in toward that same point
  img.style.transform = zoom > 1 ? "scale(" + zoom + ")" : "";
  img.src = src;
}

const img = document.getElementById("hero-img");

if (img && HERO_IMAGES.length > 1) {
  // Respect people who ask their device to reduce motion: no automatic rotating.
  // (Clicking still changes the photo, because that is the visitor's own choice.)
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- truly random ----
  // Every pick is an independent random choice from the whole list: no order, no rounds,
  // nothing to predict. The only rule is that the same photo never shows twice in a row,
  // which would look like a glitch. (Because it is truly random, some photos will come up
  // more often than others for a while, and a photo can return soon after it left.)
  function pickRandom(notThis) {
    let src;
    do {
      src = HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)];
    } while (src === notThis);
    return src;
  }

  let current = pickRandom("");   // the photo showing now
  applyPhoto(img, current);

  // Two photos are chosen ahead of time and quietly downloaded, so each swap is instant.
  // They are still random: nobody, including us, knows the order in advance.
  let upcoming = [];
  function lineUp() {
    while (upcoming.length < 2) {
      const last = upcoming.length ? upcoming[upcoming.length - 1] : current;
      const src = pickRandom(last);
      upcoming.push(src);
      new Image().src = src;   // start downloading it now
    }
  }
  lineUp();

  // Show the next photo. We load it first, so the swap is instant and never blank.
  function showNext() {
    const next = upcoming.shift();
    lineUp();
    const loader = new Image();
    loader.onload = () => {
      applyPhoto(img, next);   // instant swap, no fade
      current = next;
    };
    loader.onerror = () => {};  // if one photo fails to load, just skip it
    loader.src = next;
  }

  // The automatic timer. We keep its id so a click can restart the countdown.
  let timer = null;
  function startTimer() {
    if (reduceMotion) return;
    clearInterval(timer);
    timer = setInterval(showNext, SECONDS * 1000);
  }
  startTimer();

  // Jump to the next photo now, and start the countdown over so it doesn't
  // change again right away.
  function skip() {
    showNext();
    startTimer();
  }

  // Clicking or tapping anywhere on the page content (the photo, the name, the text)
  // changes the photo. Three exceptions:
  //  - links, which should just open;
  //  - empty space, which theme.js uses to switch light/dark;
  //  - when you are selecting text to copy it.
  const home = document.querySelector("main.home");
  home.addEventListener("click", (e) => {
    if (e.target === home) return;               // empty space inside the column
    if (e.target.closest("a")) return;           // a link
    if (String(window.getSelection())) return;   // text is selected
    skip();
  });

  // Keyboard: Enter or Space while the photo is focused.
  const hero = img.parentElement;
  hero.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();   // stop Space from scrolling the page
      skip();
    }
  });
}

// Turn each email into a real clickable mailto: link.
// The address is stored in two pieces in the HTML (data-user and data-domain) so simple
// bots reading the page text don't find a complete address.
document.querySelectorAll("a.email").forEach((a) => {
  a.href = "mailto:" + a.dataset.user + "@" + a.dataset.domain;
});
