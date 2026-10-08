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
const SECONDS = 2; // how long between photo changes

const img = document.getElementById("hero-img");

if (img && HERO_IMAGES.length > 1) {
  // Respect people who ask their device to reduce motion: no automatic rotating.
  // (Clicking the photo still works, because that is the visitor's own choice.)
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Pick a random photo that is not the one currently showing.
  function pickNext(current) {
    let next;
    do {
      next = HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)];
    } while (next === current);
    return next;
  }

  // Start on a random photo, not always the first.
  let current = pickNext("");
  img.src = current;

  // Show another random photo. Load it in the background first, so the swap is
  // instant and never blank.
  function showNext() {
    const next = pickNext(current);
    const loader = new Image();
    loader.onload = () => {
      img.src = next;   // instant swap, no fade
      current = next;
    };
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

  // Clicking (or pressing Enter / Space on) the photo jumps to another one,
  // and the 2-second countdown starts over so it doesn't change again right away.
  const hero = img.parentElement;
  function skip() {
    showNext();
    startTimer();
  }
  hero.addEventListener("click", skip);
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
