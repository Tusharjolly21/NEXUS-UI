#!/usr/bin/env node
/**
 * Renders one of the Nexus videos to MP4, a frame at a time.
 *
 * The videos are pure functions of time, so nothing has to be recorded: this script opens your frame
 * page, sets the clock to each frame's time, takes a screenshot and pipes them into ffmpeg.
 *
 *   npm i -D playwright && npx playwright install chromium     (once)
 *   node render.mjs --url http://localhost:3000/video-frame --duration 12 --audio launch-reel.mp3 --out launch-reel.mp4
 *   node render.mjs --url http://localhost:3000/video-frame --format 16:9 --duration 12 --audio install-seconds.mp3 --out install-16x9.mp4
 *
 * Flags
 *   --url        a page that mounts the video (see frame.tsx). It must set window.__videoReady = true
 *                and expose window.__setT(seconds).
 *   --duration   length in seconds (it is in the video's page and its meta)
 *   --format     the shape: 9:16 (default), 4:5, 1:1, 16:9, app or 21:9. Adds ?f=<format> to the url and
 *                sizes the frame to match (see frame.tsx, which reads it)
 *   --out        output file (default video.mp4)
 *   --audio      optional soundtrack to add (the .mp3 that comes with the video)
 *   --width      output width in pixels (default: the shape's own, e.g. 1080 for 9:16, 1920 for 16:9);
 *                the height follows the shape. Use a smaller number for a quick draft
 *   --fps        frames per second (default 30)
 *
 * Needs ffmpeg on your PATH.
 */
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const SHAPES = { "9:16": [1080, 1920], "4:5": [1080, 1350], "1:1": [1080, 1080], "16:9": [1920, 1080], app: [886, 1920], "21:9": [2520, 1080] };
const format = args.format ?? "9:16";
if (!SHAPES[format]) {
  console.error(`Unknown --format ${format}. Use one of: ${Object.keys(SHAPES).join(", ")}`);
  process.exit(1);
}
const [shapeW, shapeH] = SHAPES[format];
const url = args.url && `${args.url}${args.url.includes("?") ? "&" : "?"}f=${encodeURIComponent(format)}`;
const duration = Number(args.duration);
const out = args.out ?? "video.mp4";
const width = Number(args.width ?? shapeW);
const height = Math.round((width * shapeH) / shapeW);
const fps = Number(args.fps ?? 30);
if (!url || !duration) {
  console.error("Usage: node render.mjs --url <frame page> --duration <seconds> [--format 9:16] [--audio file.mp3] [--out video.mp4] [--width 1080] [--fps 30]");
  process.exit(1);
}

const ff = spawn(
  "ffmpeg",
  [
    "-y", "-loglevel", "error",
    "-f", "image2pipe", "-framerate", String(fps), "-i", "-",
    ...(args.audio ? ["-i", args.audio] : []),
    "-t", String(duration),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-movflags", "+faststart",
    ...(args.audio ? ["-c:a", "aac", "-b:a", "192k"] : ["-an"]),
    out,
  ],
  { stdio: ["pipe", "inherit", "inherit"] },
);
const done = new Promise((resolve, reject) => {
  ff.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`))));
  ff.on("error", reject);
});

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__videoReady === true, null, { timeout: 30000 });

const frames = Math.round(duration * fps);
for (let i = 0; i < frames; i++) {
  const t = i / fps;
  await page.evaluate((t) => window.__setT(t), t);
  // let any image that just appeared finish decoding, then wait for two paints
  await page.evaluate(() => Promise.all([...document.images].filter((im) => !im.complete).map((im) => im.decode().catch(() => {}))));
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const png = await page.screenshot({ type: "png" });
  if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once("drain", r));
  if (i % fps === 0) process.stdout.write(`\r${Math.round((i / frames) * 100)}%`);
}
ff.stdin.end();
await done;
await browser.close();
console.log(`\rDone: ${out}`);
