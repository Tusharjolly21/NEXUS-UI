// Usage: node /tmp/claude-0/tpl/shoot.mjs <slug> <outdir> [width=1440] [height=900]
// Scrolls the isolated template preview one viewport at a time and saves a screenshot per step.
// Prints page errors, failed same-origin requests, horizontal overflow and the page height.
import { chromium } from "playwright";
const [slug, out, w = "1440", h = "900"] = process.argv.slice(2);
const width = Number(w), height = Number(h);
const fs = await import("node:fs");
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width, height } });
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 300)));
page.on("console", (m) => { if (m.type() === "error" && !/ERR_TUNNEL|Failed to load resource/.test(m.text())) errors.push("console: " + m.text().slice(0, 300)); });
await page.goto(`http://localhost:3123/live-preview/template/${slug}`, { waitUntil: "load", timeout: 240000 });
await page.waitForTimeout(2500);
const total = await page.evaluate(() => document.documentElement.scrollHeight);
let y = 0, i = 0;
while (y < total && i < 40) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/${String(i).padStart(2, "0")}.png` });
  y += height; i++;
}
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
console.log(JSON.stringify({ slug, width, pageHeight: total, shots: i, horizontalOverflowPx: overflow, errors: errors.slice(0, 15) }, null, 1));
await browser.close();
