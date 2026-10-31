// Takes the screenshots shown when hovering a link (images/previews/NAME.webp).
// Run when links change:  node scripts/capture_previews.cjs   (needs Playwright and Python 3 with Pillow)
// It collects every link from the site's pages, skips social sites (they show login walls to
// automated browsers), screenshots each page at 1280x800 and saves a small WebP.
// NAME is made from the address the same way theme.js does it (see previewName there).
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const fs = require("fs"), path = require("path"), { execFileSync, spawn } = require("child_process");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "images", "previews");
// No preview for: social sites (login walls), font servers and forbes.com (blocks automated browsers).
// amns.in opens on a video and a pop-up, so its preview was taken by hand (scrolled past both) and is kept.
const SKIP = /(^|\.)(linkedin\.com|x\.com|twitter\.com|instagram\.com|forbes\.com|amns\.in|youtube\.com|substack\.com|googleapis\.com|gstatic\.com)$/;
// Pages that are already clean; clicking their "close" buttons would change the layout.
const NO_CLEANUP = /(^|\.)github\.com$/;
const PAGES = ["index.html", "work/index.html", "projects/index.html", "blog/index.html", "photography/index.html", "rabbit-hole/index.html"];

function previewName(u) {
  return (u.hostname.replace(/^www\./, "") + u.pathname).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

// Clear what covers a page: accept/close buttons first, then any pop-up still in the way
// (named like one, or a large layer stacked on top of everything).
async function clearPopups(page) {
  for (const label of [/accept/i, /agree/i, /got it/i, /close/i, /^ok$/i, /dismiss/i, /^×$|^x$/i]) {
    const b = page.getByRole("button", { name: label }).first();
    if (await b.isVisible().catch(() => false)) await b.click({ timeout: 1500 }).catch(() => {});
  }
  await page.evaluate(() => {
    const vw = innerWidth, vh = innerHeight;
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.position !== "fixed" && cs.position !== "sticky") continue;
      const r = el.getBoundingClientRect();
      const named = /cookie|consent|privacy|gdpr|modal|popup|pop-up|overlay|newsletter|disclaimer|banner-notice/i.test(String(el.className) + " " + el.id);
      const onTop = r.width * r.height > vw * vh * 0.18 && (parseInt(cs.zIndex, 10) || 0) >= 1000;
      if (named || onTop) el.remove();
    }
    document.documentElement.style.overflow = document.body.style.overflow = "auto";
  });
  await page.waitForTimeout(600);
}

(async () => {
  const links = new Map();   // name -> address to capture
  for (const p of PAGES) {
    const html = fs.readFileSync(path.join(ROOT, p), "utf8");
    for (const m of html.matchAll(/<a\b[^>]*href="([^"#]+)"/g)) {
      const href = m[1];
      if (href.startsWith("mailto:")) continue;
      if (/^https?:/.test(href)) {
        const u = new URL(href);
        if (!SKIP.test(u.hostname)) links.set(previewName(u), href);
      } else {   // one of our own pages
        const u = new URL(href, "https://shravanlad.com/" + p);
        links.set(previewName(u), "LOCAL" + u.pathname);
      }
    }
  }
  fs.mkdirSync(OUT, { recursive: true });
  const server = spawn("python3", ["-m", "http.server", "8799"], { cwd: ROOT, stdio: "ignore" });
  await new Promise(r => setTimeout(r, 800));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  for (const [name, target] of links) {
    const url = target.startsWith("LOCAL") ? "http://localhost:8799" + target.slice(5) : target;
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: "load", timeout: 30000 });
      await page.waitForTimeout(3000);   // let fonts, images and banners settle
      if (!NO_CLEANUP.test(new URL(url).hostname)) await clearPopups(page);
      const text = (await page.evaluate(() => document.body.innerText)).slice(0, 400);
      if (/you have been blocked|access denied|just a moment|attention required/i.test(text) || text.trim().length < 40) throw new Error("blocked or empty page");
      const png = path.join(OUT, name + ".png");
      await page.screenshot({ path: png });
      execFileSync("python3", ["-c", "import sys;from PIL import Image;i=Image.open(sys.argv[1]).convert('RGB').resize((480,300),Image.LANCZOS);i.save(sys.argv[2],quality=78)", png, path.join(OUT, name + ".webp")]);
      fs.unlinkSync(png);
      console.log("ok  ", name, "<-", url);
    } catch (e) {
      console.log("skip", name, "<-", url, String(e).split("\n")[0]);
    }
    await page.close();
  }
  await browser.close(); server.kill();
  // The list theme.js reads, so it only offers a card for links that have a screenshot.
  const have = fs.readdirSync(OUT).filter(f => f.endsWith(".webp")).map(f => f.slice(0, -5)).sort();
  fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify(have, null, 1) + "\n");
  console.log(have.length, "previews listed in images/previews/index.json");
})();
