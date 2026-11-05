/**
 * Takes a still of every component and block preview for its share card (src/app/api/og), so a
 * shared link shows the thing itself, not only its name.
 *
 *   npm run dev                                  # in one terminal
 *   node scripts/capture-og-shots.mjs            # in another; add slugs to redo only those
 *
 * Each preview is drawn on its own gallery canvas at /dev/tile-lab (the canvas sizes and the
 * background colour come from tile-fit.generated.json), left to play for a moment so the shot is
 * mid-animation rather than on frame one, then cropped to the part it draws, with a margin, and
 * saved as a JPEG in public/og-shots/<components|blocks>/<slug>.jpg. Files that already exist are
 * skipped unless named on the command line, so a run that stops can simply be started again.
 *
 * Machines without a GPU draw WebGL in software, which the shader components refuse; the script
 * reports a GPU to them so they render. Set TILE_LAB_URL if the dev server is not on :3000.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = process.env.TILE_LAB_URL ?? "http://localhost:3000";
const outDir = path.join(root, "public", "og-shots");
const fit = JSON.parse(fs.readFileSync(path.join(root, "src/lib/catalog/tile-fit.generated.json"), "utf8"));
const only = new Set(process.argv.slice(2));

const items = await fetch(`${base}/dev/tile-lab/items`).then((r) => {
  if (!r.ok) throw new Error(`Start the dev server first (${base}/dev/tile-lab/items → ${r.status})`);
  return r.json();
});

const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader"] });
// twice the pixels, so a close crop of a small component is still sharp
const DPR = 2;
const context = await browser.newContext({ deviceScaleFactor: DPR });
await context.addCookies([{ name: "nx-consent", value: "denied", url: base }]);
// the shader components skip software WebGL; tell them it is a GPU so they draw for the still
await context.addInitScript(() => {
  for (const C of [window.WebGLRenderingContext, window.WebGL2RenderingContext].filter(Boolean)) {
    const get = C.prototype.getParameter;
    C.prototype.getParameter = function (x) {
      return x === 0x9246 ? "ANGLE (OG capture)" : get.call(this, x);
    };
  }
});

/**
 * Components whose best part is small: the shot zooms in on this element (the first visible match),
 * so the card shows it up close, the way the page's own preview magnifies it.
 */
const FOCUS = {
  // caught before its tour moves on, while the metal frame sits still on the first tab
  "mercury-tabs": { selector: '[role="tab"][aria-selected="true"]', scale: 1.9, wait: 2000 },
};

let done = 0, skipped = 0, failed = 0;
for (const item of items) {
  if (!item.exportName) continue;
  const kind = item.group === "blocks" ? "blocks" : "components";
  const file = path.join(outDir, kind, `${item.slug}.jpg`);
  if (only.size ? !only.has(item.slug) : fs.existsSync(file)) {
    skipped++;
    continue;
  }
  const f = fit[item.slug] ?? {};
  const [w, h] = f.canvas ?? [960, 720];
  const bg = f.bg || "#f5f5f7";
  const page = await context.newPage();
  try {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(`${base}/dev/tile-lab?e=${item.exportName}&w=${w}&h=${h}`, { waitUntil: "networkidle", timeout: 90_000 });
    await page.addStyleTag({ content: `:root{--tile-lab-sentinel:${bg}}` });
    await page.waitForSelector("#tile-lab-stage", { timeout: 60_000 });
    // let it play into the middle of its demo; shaders in software WebGL need longer to get going
    await page.waitForTimeout(FOCUS[item.slug]?.wait ?? (item.group === "effects" ? 5500 : 3200));
    const focus = FOCUS[item.slug];
    const focusBox = focus
      ? await page.evaluate((sel) => {
          const el = [...document.querySelectorAll(sel)].find((e) => e.getBoundingClientRect().width > 0);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return [r.x, r.y, r.width, r.height];
        }, focus.selector)
      : null;
    const png = await page.screenshot({ clip: { x: 0, y: 0, width: w, height: h }, timeout: 60_000 });
    // crop to what the preview draws (its surface and its content together), with room around it, at 4:3,
    // and never tighter than a quarter of the canvas so a small button is not blown up into a blur
    const box = [f.surface, f.content].filter(Boolean).reduce(
      (a, [x, y, bw, bh]) => [Math.min(a[0], x), Math.min(a[1], y), Math.max(a[2], x + bw), Math.max(a[3], y + bh)],
      [w, h, 0, 0],
    );
    if (box[2] <= box[0]) box.splice(0, 4, 0, 0, w, h);
    let bw = Math.max((box[2] - box[0]) * 1.3, w * 0.42), bh = Math.max((box[3] - box[1]) * 1.3, h * 0.42);
    if (focusBox) {
      // centre on the focus element and make it a large share of the frame
      const [fx, fy, fw, fh] = focusBox;
      box.splice(0, 4, fx, fy, fx + fw, fy + fh);
      bw = Math.max(fw, fh * (4 / 3)) * focus.scale;
      bh = bw * 0.75;
    }
    const midX = (box[0] + box[2]) / 2, midY = (box[1] + box[3]) / 2;
    if (bw / bh < 4 / 3) bw = bh * (4 / 3);
    else bh = bw / (4 / 3);
    if (bw > w) { bw = w; bh = w * 0.75; }
    if (bh > h) { bh = h; bw = h * (4 / 3); }
    const x0 = Math.round(Math.min(Math.max(0, midX - bw / 2), w - bw));
    const y0 = Math.round(Math.min(Math.max(0, midY - bh / 2), h - bh));
    const x1 = Math.round(x0 + bw), y1 = Math.round(y0 + bh);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    await sharp(png)
      .extract({ left: x0 * DPR, top: y0 * DPR, width: (x1 - x0) * DPR, height: (y1 - y0) * DPR })
      .resize({ width: 880, height: 660, fit: "cover", background: bg })
      .flatten({ background: bg })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(file);
    done++;
    console.log(`ok  ${kind}/${item.slug}`);
  } catch (e) {
    failed++;
    console.log(`err ${kind}/${item.slug}: ${String(e?.message ?? e).split("\n")[0]}`);
  } finally {
    await page.close();
  }
}
await browser.close();
console.log(`\n${done} captured, ${skipped} skipped, ${failed} failed`);
