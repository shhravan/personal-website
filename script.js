// Hero image rotation.
// Each photo exists in images/hero/ in two sizes: NAME.webp (1200px wide, laptops and sharp screens)
// and NAME-700.webp (700px wide, phones). To add a photo, add both files and its name below.
const PHOTOS = [
  "408866-natsamrat9",
  "651538914-18003763976893575-816255035336",
  "a3116366373-16",
  "ab67616d0000b27319497200ef054bccfab27d0c",
  "afre-bnr24",
  "beautifully-carved-idol-god-vitthal-temp",
  "chhatrapati-shivaji-maharaj-silhouette-7",
  "classicu-2024-05-26-164754-130-2",
  "classicu-2024-06-12-171241-154",
  "entering-in-dwaraka-scaled",
  "esplanade-activies",
  "harvey-mike",
  "images",
  "liam-noel-gallagher-oasis",
  "michelangelo-creation-of-adam-cropped",
  "mv5bmtvhotziztmty2uzns00mmfmltg0mgqtymy5",
  "opwzd1y86ropvxlj",
  "partha-sarathi-scaled",
  "pcrc-beta-png2",
  "queen-wallpaper-1920x1080",
  "s-vfh-shawshank-redemption-20th-annivers",
  "shutterisland",
  "sisyphus-jeffrey-hummel",
  "the-choice-scaled",
  "thequint-2021-07-164cebd4-b9ef-4dda-af8b",
  "tsunami-by-hokusai-19th-century",
  "tumbbad",
  "view-from-ad-white-house-hill-1930-rmc20",
];

// How each photo is framed in the wide frame: [x, y, zoom].
//  x and y: the point of the photo to keep in view, as a percentage (50, 50 is the middle).
//  zoom: 1 shows the whole width; 1.3 zooms in 30% around that point.
const FOCUS = {
  "408866-natsamrat9": [50, 10, 1],
  "651538914-18003763976893575-816255035336": [50, 58, 1],
  "a3116366373-16": [50, 45, 1],
  "ab67616d0000b27319497200ef054bccfab27d0c": [50, 20, 1],
  "afre-bnr24": [50, 50, 1],
  "beautifully-carved-idol-god-vitthal-temp": [50, 40, 1],
  "chhatrapati-shivaji-maharaj-silhouette-7": [45, 42, 1.2],
  "classicu-2024-05-26-164754-130-2": [45, 65, 1.1],
  "classicu-2024-06-12-171241-154": [70, 68, 1.4],
  "entering-in-dwaraka-scaled": [50, 50, 1.22],
  "esplanade-activies": [50, 55, 1],
  "harvey-mike": [50, 0, 1],
  "images": [50, 40, 1],
  "liam-noel-gallagher-oasis": [50, 8, 1],
  "michelangelo-creation-of-adam-cropped": [45, 50, 1],
  "mv5bmtvhotziztmty2uzns00mmfmltg0mgqtymy5": [52, 60, 1.25],
  "opwzd1y86ropvxlj": [50, 45, 1],
  "partha-sarathi-scaled": [45, 52, 1.15],
  "pcrc-beta-png2": [50, 15, 1],
  "queen-wallpaper-1920x1080": [50, 20, 1],
  "s-vfh-shawshank-redemption-20th-annivers": [50, 30, 1],
  "shutterisland": [50, 50, 1],
  "sisyphus-jeffrey-hummel": [50, 38, 1],
  "the-choice-scaled": [50, 35, 1.22],
  "thequint-2021-07-164cebd4-b9ef-4dda-af8b": [50, 20, 1],
  "tsunami-by-hokusai-19th-century": [50, 45, 1],
  "tumbbad": [50, 75, 1.3],
  "view-from-ad-white-house-hill-1930-rmc20": [55, 35, 1],
};

// Each photo stays a random time between these two (seconds), so there is no rhythm to predict.
const MIN_SECONDS = 0.4;
const MAX_SECONDS = 1.0;

// Pick the smaller file when the frame is small enough (phones), the larger one otherwise.
function photoUrl(name) {
  const frame = document.querySelector(".hero");
  const pixels = (frame ? frame.clientWidth : 500) * (window.devicePixelRatio || 1);
  return "images/hero/" + name + (pixels <= 700 ? "-700" : "") + ".webp";
}

// Show a photo in the frame, using its framing from the FOCUS list.
function applyPhoto(img, name) {
  const [x, y, zoom] = FOCUS[name] || [50, 50, 1];
  img.style.objectPosition = x + "% " + y + "%";   // which part of the photo stays in view
  img.style.transformOrigin = x + "% " + y + "%";  // zoom in toward that same point
  img.style.transform = zoom > 1 ? "scale(" + zoom + ")" : "";
  img.src = photoUrl(name);
}

const img = document.getElementById("hero-img");

if (img && PHOTOS.length > 1) {
  // Respect people who ask their device to reduce motion: no automatic rotating.
  // (Clicking still changes the photo, because that is the visitor's own choice.)
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- random, with no repeats until every photo has shown ----
  // Shuffle the whole list like a deck of cards and deal it out. Only when the deck runs out
  // is it reshuffled, so every photo appears once before any photo appears twice. The new
  // deck is checked so its first photo is never the one that just showed.
  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];   // swap two items
    }
    return list;
  }

  let deck = shuffle(PHOTOS.slice());
  let current = deck.shift();       // the photo showing now
  applyPhoto(img, current);

  function nextName() {
    if (deck.length === 0) {
      deck = shuffle(PHOTOS.slice());
      if (deck[0] === current) deck.push(deck.shift());   // no repeat across the reshuffle
    }
    return deck.shift();
  }

  // Quietly download the next two photos so each swap is instant.
  function preloadAhead() {
    if (deck.length < 2) return;   // they are fetched as soon as the new deck exists
    deck.slice(0, 2).forEach((name) => { new Image().src = photoUrl(name); });
  }
  preloadAhead();

  // Show the next photo. We load it first, so the swap is instant and never blank.
  function showNext() {
    const next = nextName();
    const loader = new Image();
    loader.onload = () => {
      applyPhoto(img, next);   // instant swap, no fade
      current = next;
      preloadAhead();
    };
    loader.onerror = () => {};  // if one photo fails to load, just skip it
    loader.src = photoUrl(next);
  }

  // The automatic timer: each wait is a fresh random length between MIN and MAX.
  let timer = null;
  function startTimer() {
    if (reduceMotion) return;
    clearTimeout(timer);
    const wait = (MIN_SECONDS + Math.random() * (MAX_SECONDS - MIN_SECONDS)) * 1000;
    timer = setTimeout(() => { showNext(); startTimer(); }, wait);
  }
  startTimer();

  // Jump to the next photo now, and start a new countdown.
  function skip() {
    showNext();
    startTimer();
  }

  // Clicking or tapping anywhere on the home page changes the photo (field.js also sends a
  // ripple from the same click). Links, buttons and selecting text are left alone.
  document.addEventListener("click", (e) => {
    if (e.target.closest("a, button")) return;
    if (String(window.getSelection())) return;
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
