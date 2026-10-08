// Hero image rotation.
// To add photos: put the files in images/hero/ and add their names to this list.
// (Later, the build script will make this list automatically from the folder.)
const HERO_IMAGES = [
  "images/hero/placeholder-1.jpg",
  "images/hero/placeholder-2.jpg",
  "images/hero/placeholder-3.jpg",
  "images/hero/placeholder-4.jpg",
];
const SECONDS = 2; // how long between photo changes

const img = document.getElementById("hero-img");

if (img && HERO_IMAGES.length > 1) {
  // Respect people who ask their device to reduce motion: show one photo, no rotating.
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

  if (!reduceMotion) {
    setInterval(() => {
      const next = pickNext(current);
      // Load the next photo in the background first, so the swap is instant and never blank.
      const loader = new Image();
      loader.onload = () => {
        img.src = next;                           // instant swap, no fade
        current = next;
      };
      loader.src = next;
    }, SECONDS * 1000);
  }
}

// Turn each email into a real clickable mailto: link.
// The address is stored in two pieces in the HTML (data-user and data-domain) so simple
// bots reading the page text don't find a complete address.
document.querySelectorAll("a.email").forEach((a) => {
  a.href = "mailto:" + a.dataset.user + "@" + a.dataset.domain;
});
