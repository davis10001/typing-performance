import { chromium } from "playwright";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const base = resolve("design");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(resolve(base, "typing-level-architecture-concept.html")).href);
await page.evaluate(() => document.fonts.ready);

for (const [id, filename] of [
  ["home-desktop", "typing-level-home-desktop-concept.png"],
  ["home-mobile", "typing-level-home-mobile-concept.png"],
  ["test-desktop", "typing-level-test-page-concept.png"],
  ["info-desktop", "typing-level-content-page-concept.png"],
]) {
  await page.locator(`#${id}`).screenshot({ path: resolve(base, filename) });
}

const result = await page.evaluate(() => ({
  images: [...document.images].map((img) => ({ loaded: img.complete && img.naturalWidth > 0, src: img.getAttribute("src") })),
  frames: [...document.querySelectorAll(".artboard")].map((frame) => ({ id: frame.id, width: frame.clientWidth, height: frame.clientHeight })),
}));
console.log(JSON.stringify(result));
await browser.close();
