// Usage: node /tmp/claude-0/tpl/previews.mjs <slug> "<css selector for section 1>" "<s2>" "<s3>" "<s4>"
// Saves 1440x900 WebP previews to nexus-ui/public/templates/<slug>/: hero.webp (top of page)
// and section-1..4.webp (each selector scrolled to the top of the viewport, animations settled).
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
const [slug, ...selectors] = process.argv.slice(2);
if (!slug || selectors.length !== 4) { console.error("need slug + 4 selectors"); process.exit(1); }
const outDir = `/home/claude/nexus-ui/public/templates/${slug}`;
const tmp = `/tmp/claude-0/tpl/previews-${slug}`;
fs.mkdirSync(outDir, { recursive: true }); fs.mkdirSync(tmp, { recursive: true });
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`http://localhost:3123/live-preview/template/${slug}`, { waitUntil: "load", timeout: 240000 });
// The shared dev server is slow under load: wait for the network to settle, then for motion to finish.
await page.waitForLoadState("networkidle", { timeout: 180000 }).catch(() => console.log("networkidle wait timed out"));
await page.waitForTimeout(5000);
await page.screenshot({ path: `${tmp}/hero.png`, timeout: 120000 });
for (let i = 0; i < 4; i++) {
  const el = await page.$(selectors[i]);
  if (!el) { console.error(`selector not found: ${selectors[i]}`); process.exit(2); }
  await el.evaluate((n) => window.scrollTo(0, n.getBoundingClientRect().top + window.scrollY - 40));
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${tmp}/section-${i + 1}.png`, timeout: 120000 });
}
await browser.close();
const names = ["hero", "section-1", "section-2", "section-3", "section-4"];
execFileSync("python3", ["-c", `
from PIL import Image
for n in ${JSON.stringify(names)}:
    Image.open("${tmp}/"+n+".png").convert("RGB").save("${outDir}/"+n+".webp","WEBP",quality=82,method=6)
`]);
console.log(`wrote ${names.map((n) => `${outDir}/${n}.webp`).join(", ")}`);
