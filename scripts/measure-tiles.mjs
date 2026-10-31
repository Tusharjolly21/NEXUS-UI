/**
 * Measures where every gallery preview actually draws, so each bento tile can be sized to its own
 * component (see src/lib/catalog/tile-fit.ts).
 *
 *   npm run dev                      # in one terminal
 *   node scripts/measure-tiles.mjs   # in another; add slugs to re-measure only those
 *
 * Each preview is rendered on its canvas (tile-fit.config.json) over a magenta sentinel at
 * /dev/tile-lab, screenshotted twice (animations move), and the pixels are compared to find the
 * preview's own surface (non-sentinel), its background colour and the box its content occupies.
 * Results go to src/lib/catalog/tile-fit.generated.json after every component; set
 * TILE_LAB_MISSING=1 to measure only the ones not in it yet. Set PUPPETEER_EXECUTABLE_PATH to use a
 * local Chrome, and TILE_LAB_URL if the dev server is not on http://localhost:3000.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = process.env.TILE_LAB_URL ?? "http://localhost:3000";
const configPath = path.join(root, "src/lib/catalog/tile-fit.config.json");
const outPath = path.join(root, "src/lib/catalog/tile-fit.generated.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const only = new Set(process.argv.slice(2));

const items = await fetch(`${base}/dev/tile-lab/items`).then((r) => {
  if (!r.ok) throw new Error(`Start the dev server first (${base}/dev/tile-lab/items → ${r.status})`);
  return r.json();
});

const previous = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, "utf8")) : {};
const result = { ...previous };

const browser = await puppeteer.launch({
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  args: ["--no-sandbox", "--enable-webgl", "--ignore-gpu-blocklist"],
  protocolTimeout: 120_000,
});
const debugDir = process.env.TILE_LAB_DEBUG_DIR;
if (debugDir) fs.mkdirSync(debugDir, { recursive: true });
// The site's cookie banner is fixed to the bottom left of every page; left up it would be measured as part of the preview.
const newPage = async () => {
  const p = await browser.newPage();
  await p.setCookie({ name: "nx-consent", value: "denied", url: base });
  return p;
};
let page = await newPage();

/**
 * Runs in the page. `shots` holds pairs of screenshots taken over a magenta and then a green
 * sentinel: pixels that change with the sentinel are see-through, the rest is the preview.
 */
async function analyse(shots) {
  const load = (b64) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(ctx.getImageData(0, 0, img.width, img.height));
      };
      img.src = `data:image/png;base64,${b64}`;
    });
  const frames = await Promise.all(shots.flat().map(load));
  const pairs = [];
  for (let i = 0; i < frames.length; i += 2) pairs.push([frames[i], frames[i + 1]]);
  const { width: W, height: H } = frames[0];
  const px = (f, x, y) => {
    const i = (y * W + x) * 4;
    return [f.data[i], f.data[i + 1], f.data[i + 2]];
  };
  const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
  const MAGENTA = [255, 0, 255];
  const GREEN = [0, 255, 0];
  // something is drawn here (even translucently) if neither sentinel shows through untouched
  const drawn = ([m, g], x, y) => dist(px(m, x, y), MAGENTA) > 40 && dist(px(g, x, y), GREEN) > 40;
  // fully opaque if the two sentinels make no difference
  const opaque = ([m, g], x, y) => dist(px(m, x, y), px(g, x, y)) < 30;

  // 1. surface: everything drawn in the first moment
  const [p0] = pairs;
  let sx0 = W, sy0 = H, sx1 = -1, sy1 = -1, surface = 0;
  for (let y = 0; y < H; y += 2)
    for (let x = 0; x < W; x += 2)
      if (opaque(p0, x, y)) {
        surface++;
        if (x < sx0) sx0 = x;
        if (x > sx1) sx1 = x;
        if (y < sy0) sy0 = y;
        if (y > sy1) sy1 = y;
      }
  if (sx1 < 0) [sx0, sy0, sx1, sy1] = [0, 0, W - 1, H - 1];
  const coverage = surface / (Math.ceil(W / 2) * Math.ceil(H / 2));

  // 2. background: the dominant opaque colour on a ring just inside the surface
  let bg = null;
  {
    const counts = new Map();
    let total = 0;
    const inset = 12;
    const ring = [];
    for (let x = sx0 + inset; x < sx1 - inset; x += 4) ring.push([x, sy0 + inset], [x, sy1 - inset]);
    for (let y = sy0 + inset; y < sy1 - inset; y += 4) ring.push([sx0 + inset, y], [sx1 - inset, y]);
    for (const [x, y] of ring) {
      if (!opaque(p0, x, y)) continue;
      total++;
      const key = px(p0[0], x, y).map((v) => Math.round(v / 6) * 6).join(",");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] > Math.max(8, ring.length * 0.45)) bg = top[0].split(",").map(Number);
  }

  // 2b. with no single background (a gradient or translucent panel), the most common solid
  //     colour is still the panel, not the component
  let panel = null;
  if (!bg) {
    const counts = new Map();
    for (let y = sy0; y < sy1; y += 6)
      for (let x = sx0; x < sx1; x += 6) {
        if (!opaque(p0, x, y)) continue;
        const key = px(p0[0], x, y).map((v) => Math.round(v / 8) * 8).join(",");
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (top) panel = top[0].split(",").map(Number);
  }

  // 3. content: anything drawn that isn't background, ignoring the surface's own edge
  //    (borders, rounded corners and shadows of the preview's frame)
  const edge = 10;
  let cx0 = W, cy0 = H, cx1 = -1, cy1 = -1;
  for (const pair of pairs)
    for (let y = 0; y < H; y += 2)
      for (let x = 0; x < W; x += 2) {
        if (!drawn(pair, x, y)) continue;
        if (x < sx0 + edge || x > sx1 - edge || y < sy0 + edge || y > sy1 - edge) continue;
        if (bg) {
          if (opaque(pair, x, y) && dist(px(pair[0], x, y), bg) < 30) continue;
        } else if (!opaque(pair, x, y)) {
          // see-through surface (e.g. a translucent gradient panel): only solid things count
          continue;
        } else if (panel && dist(px(pair[0], x, y), panel) < 40) {
          continue;
        }
        if (x < cx0) cx0 = x;
        if (x > cx1) cx1 = x;
        if (y < cy0) cy0 = y;
        if (y > cy1) cy1 = y;
      }
  if (cx1 < 0) [cx0, cy0, cx1, cy1] = [sx0, sy0, sx1, sy1];
  const hex = bg ? `#${bg.map((v) => Math.min(255, v).toString(16).padStart(2, "0")).join("")}` : null;
  return {
    surface: [sx0, sy0, sx1 - sx0 + 2, sy1 - sy0 + 2],
    content: [cx0, cy0, cx1 - cx0 + 2, cy1 - cy0 + 2],
    bg: hex,
    coverage: Math.round(coverage * 100) / 100,
  };
}

/** Screenshot the stage over both sentinels, back to back. */
async function shootPair(clip) {
  const magenta = await page.screenshot({ clip, encoding: "base64" });
  await page.evaluate(() => document.documentElement.style.setProperty("--tile-lab-sentinel", "#00ff00"));
  const green = await page.screenshot({ clip, encoding: "base64" });
  await page.evaluate(() => document.documentElement.style.removeProperty("--tile-lab-sentinel"));
  return [magenta, green];
}

const missingOnly = process.env.TILE_LAB_MISSING === "1";
const save = () => {
  const sorted = Object.fromEntries(Object.keys(result).sort().map((k) => [k, result[k]]));
  fs.writeFileSync(outPath, `${JSON.stringify(sorted, null, 1)}\n`);
  return sorted;
};

for (const item of items) {
  if (only.size && !only.has(item.slug)) continue;
  if (missingOnly && result[item.slug]) continue;
  const [w, h] = config.canvas[item.slug] ?? config.groupCanvas[item.group] ?? config.defaultCanvas;
  try {
    await page.setViewport({ width: w + 64, height: h + 64 });
    await page
      .goto(`${base}/dev/tile-lab?e=${item.exportName}&w=${w}&h=${h}`, { waitUntil: "networkidle2", timeout: 90_000 })
      .catch(() => {});
    await page.waitForSelector("#tile-lab-stage", { timeout: 30_000 }).catch(() => {});
    // wait for the lazily loaded preview to replace its spinner
    await page
      .waitForFunction(() => !document.querySelector("#tile-lab-stage .animate-spin.border-t-primary"), { timeout: 60_000 })
      .catch(() => {});
    await new Promise((r) => setTimeout(r, config.settleMs ?? 2600));
    const clip = { x: 0, y: 0, width: w, height: h };
    const first = await shootPair(clip);
    await new Promise((r) => setTimeout(r, 1600));
    const second = await shootPair(clip);
    if (debugDir) fs.writeFileSync(path.join(debugDir, `${item.slug}.png`), Buffer.from(second[0], "base64"));
    const m = await page.evaluate(analyse, [first, second]);
    result[item.slug] = { canvas: [w, h], ...m };
    save();
    console.log(`${item.slug.padEnd(30)} content ${m.content.join(",").padEnd(20)} bg ${m.bg ?? "none"}`);
  } catch (error) {
    // a heavy preview (WebGL, huge canvases) can stall the renderer: skip it, keep going
    console.warn(`${item.slug.padEnd(30)} skipped: ${String(error).split("\n")[0]}`);
    await page.close().catch(() => {});
    page = await newPage();
  }
}

await browser.close();
const sorted = save();
console.log(`\nWrote ${Object.keys(sorted).length} measurements to ${path.relative(root, outPath)}`);
