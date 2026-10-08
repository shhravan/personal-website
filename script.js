// Hero image rotation.
// To add photos: put the files in images/hero/ and add their names to this list.
// (Later, the build script will make this list automatically from the folder.)
const HERO_IMAGES = [
  "images/hero/20250925060832-dsc04413.jpg",
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
// Photos that crop badly in the wide frame can name where to focus: "x% y%".
// "50% 20%" means centered sideways, and 20% of the way down from the top.
const FOCUS = {
  "images/hero/ab67616d0000b27319497200ef054bccfab27d0c.jpg": "50% 20%",
};

const SECONDS = 1; // seconds each photo stays (use 0.5 for two photos per second)

const img = document.getElementById("hero-img");

if (img && HERO_IMAGES.length > 1) {
  // Respect people who ask their device to reduce motion: no automatic rotating.
  // (Clicking still changes the photo, because that is the visitor's own choice.)
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- fully random order ----
  // Shuffle the whole list like a deck of cards, show every photo once, then reshuffle.
  // This is "fully random" without ever repeating a photo back to back, and no photo
  // gets shown more often than the others.
  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];   // swap two items
    }
    return list;
  }

  // Show a photo, using its focus point if it has one (otherwise the center).
  function setPhoto(src) {
    img.style.objectPosition = FOCUS[src] || "";
    img.src = src;
  }

  let queue = [];        // photos still to come, in order
  let current = "";      // the photo showing now

  // Make sure at least `n` photos are lined up in the queue.
  function fill(n) {
    while (queue.length < n) {
      const deck = shuffle(HERO_IMAGES.slice());
      const last = queue.length ? queue[queue.length - 1] : current;
      if (deck[0] === last) [deck[0], deck[1]] = [deck[1], deck[0]]; // no repeat at the seam
      queue = queue.concat(deck);
    }
  }

  // Quietly download the next couple of photos now, so each swap is instant.
  function preloadAhead() {
    fill(3);
    queue.slice(0, 2).forEach((src) => { new Image().src = src; });
  }

  // Start on a random photo.
  fill(3);
  current = queue.shift();
  setPhoto(current);
  preloadAhead();

  // Show the next photo. We load it first, so the swap is instant and never blank.
  function showNext() {
    fill(3);
    const next = queue.shift();
    const loader = new Image();
    loader.onload = () => {
      setPhoto(next);       // instant swap, no fade
      current = next;
      preloadAhead();
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
