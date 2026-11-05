"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { TEXT_FONT } from "./ui";

/**
 * The banner at the top of the page: a hill-country skyline drawn on a small 2D canvas, with ordered (Bayer)
 * dithering so every pixel is one of two colours. Four ridges slide against each other as the pointer moves
 * across the banner. By day there is a sun ringed in an outline and drifting cloud bands; by night there is a
 * crescent moon, a glow around it and twinkling stars. The scene is drawn about 15 times a second, only while
 * the banner is on screen, and once as a still frame when the visitor prefers reduced motion.
 */

/** The scene is laid out on a 760 x 216 "world" and scaled to cover the banner. */
const WORLD_WIDTH = 760;
const WORLD_HEIGHT = 216;
const FRAME_INTERVAL_MS = 66;

/** Moon or sun position in world units. */
const SUN_X = 592;

/** 8 x 8 Bayer matrix, normalised to the open interval (0, 1). A pixel is light when its tone beats its cell. */
const BAYER_8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
].flat().map((value) => (value + 0.5) / 64);

/** Cheap deterministic hash noise in [0, 1). */
function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

/** Smooth value noise built from `hash`. */
function valueNoise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

/** Three octaves of value noise. */
const fbm = (x: number, y: number) => 0.55 * valueNoise(x, y) + 0.3 * valueNoise(x * 2.1, y * 2.1) + 0.15 * valueNoise(x * 4.3, y * 4.3);

/**
 * Four ridges, back to front. `base` and `amp` set the height in world units, `phase` offsets the three sine
 * waves, `tone` and `night` are the lightness of the ridge by day and by night, and `depth` is how far it shifts
 * with the pointer (nearer ridges move more).
 */
const RIDGES = [
  { base: 112, amp: 40, phase: [0.4, 2.1, 4], tone: 0.6, night: 0.3, depth: 4 },
  { base: 142, amp: 30, phase: [3.1, 0.7, 5.2], tone: 0.42, night: 0.19, depth: 9 },
  { base: 170, amp: 22, phase: [1.7, 4.4, 2.6], tone: 0.24, night: 0.09, depth: 15 },
  { base: 198, amp: 12, phase: [5, 1.2, 3.3], tone: 0.07, night: 0, depth: 24 },
];

/** Height of a ridge at world x. Smaller is higher up the banner. */
function ridgeY(ridge: number, x: number) {
  const { base, amp, phase } = RIDGES[ridge];
  return base - amp * (0.55 * Math.sin(x / 120 + phase[0]) + 0.3 * Math.sin(x / 47 + phase[1]) + 0.15 * Math.sin(x / 19 + phase[2]));
}

type Pointer = { x: number; smoothed: number };

/**
 * Builds the renderer for one canvas. `resize` re-measures the container and rebuilds the noise tables;
 * `draw` paints a frame at `time` (milliseconds).
 */
function createRenderer(container: HTMLElement, canvas: HTMLCanvasElement, dark: boolean, pointer: Pointer) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Each canvas pixel covers `cell` CSS pixels; phones get a slightly coarser grain.
  const cell = container.clientWidth < 500 ? 1.5 : 1.25;
  const ink = dark ? [7, 9, 8] : [44, 54, 49];
  const paper = dark ? [160, 176, 168] : [241, 239, 232];
  const sunY = dark ? 40 : 34;

  let cols = 0;
  let rows = 0;
  let image: ImageData | null = null;
  let unit = 1; // world units per canvas pixel
  let offsetX = 0; // world x of the left edge
  let offsetY = 0; // world y of the top edge
  let stride = 0; // columns per row in the noise tables (a margin wider than the canvas)
  let grain = new Float32Array(0);
  let clouds = new Float32Array(0);
  let sky = new Float32Array(0);
  const ridgeTop = RIDGES.map(() => new Float32Array(0));
  const ridgeRising = RIDGES.map(() => new Int8Array(0));

  const resize = () => {
    cols = Math.ceil(container.clientWidth / cell);
    rows = Math.ceil(container.clientHeight / cell);
    canvas.width = cols;
    canvas.height = rows;
    image = ctx.createImageData(cols, rows);

    unit = 1 / Math.max(cols / WORLD_WIDTH, rows / WORLD_HEIGHT);
    offsetX = (WORLD_WIDTH - cols * unit) / 2;
    offsetY = (WORLD_HEIGHT - rows * unit) / 2;

    stride = cols + 80;
    grain = new Float32Array(stride * rows);
    clouds = new Float32Array(stride * rows);
    sky = new Float32Array(rows);
    for (let row = 0; row < rows; row++) {
      const y = Math.max(0, offsetY + row * unit);
      // Sky tone: dark at the top and a little lighter toward the horizon at night, the reverse by day.
      sky[row] = dark ? 0.03 + 0.2 * Math.pow(y / 140, 1.6) : 0.7 + 0.32 * Math.pow(Math.min(1, y / 130), 0.7);
      for (let col = 0; col < stride; col++) {
        const x = offsetX + col * unit;
        grain[row * stride + col] = fbm(x / 14, y / 9) - 0.5;
        clouds[row * stride + col] = fbm(x / 60, y / 10);
      }
    }
    RIDGES.forEach((_, i) => {
      ridgeTop[i] = new Float32Array(cols);
      ridgeRising[i] = new Int8Array(cols);
    });
  };

  const draw = (time: number) => {
    if (!image) return;
    const data = image.data;
    pointer.smoothed += (pointer.x - pointer.smoothed) * 0.12;

    // Ridge outlines for this frame, shifted by the pointer.
    RIDGES.forEach((ridge, i) => {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * unit + pointer.smoothed * ridge.depth;
        let top = ridgeY(i, x);
        if (i === RIDGES.length - 1) {
          // The front ridge is notched into blades of grass, five world units wide.
          const blade = Math.max(0, hash(Math.floor(x / 5), 7) - 0.15) * 16;
          const fromCentre = Math.abs((((x % 5) + 5) % 5) - 2.5) / 2.5;
          top -= blade * (1 - fromCentre);
        }
        ridgeTop[i][col] = top;
        ridgeRising[i][col] = ridgeY(i, x + 2) > ridgeY(i, x - 2) ? 1 : 0;
      }
    });

    const cloudDrift = Math.floor((time * 0.004) / unit);
    for (let row = 0; row < rows; row++) {
      const y = offsetY + row * unit;
      const rowStart = row * stride;
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * unit;
        let tone = sky[row];

        if (dark) {
          // Stars: about one pixel in two hundred, each twinkling on its own phase.
          const star = hash(col, row);
          if (star > 0.995) tone = 0.55 + 0.45 * Math.sin(time / 700 + star * 90);
        }

        const dx = x - SUN_X;
        const dy = y - sunY;
        if (dx > -110 && dx < 110 && dy > -110 && dy < 110) {
          const dist2 = dx * dx + dy * dy;
          if (dark) {
            tone += 0.3 * Math.exp(-dist2 / 1800);
            // Crescent moon: a lit disc with a second, offset disc cut out of it.
            if (dist2 < 120) tone = (dx - 5) ** 2 + (dy + 3) ** 2 < 90 ? 0.04 : 1.05;
          } else {
            tone -= 0.22 * Math.exp(-dist2 / 1352);
            // Sun: a lit disc inside a thin dark ring.
            if (dist2 < 150) tone = 1.05;
            else if (dist2 < 190) tone = 0;
          }
        }

        if (!dark && y < 96) {
          // Cloud band across the upper sky, drifting sideways.
          const band = Math.exp(-((y - 58) ** 2) / 120);
          if (band > 0.05) tone -= Math.max(0, clouds[rowStart + ((col + cloudDrift) % stride)] - 0.58) * 1.4 * band;
        }

        // Paint from the front ridge backwards; the first ridge that covers this pixel wins.
        for (let i = RIDGES.length - 1; i >= 0; i--) {
          const top = ridgeTop[i][col];
          if (y < top) continue;
          const ridge = RIDGES[i];
          const shift = Math.round((pointer.smoothed * ridge.depth) / unit);
          tone =
            (dark ? ridge.night : ridge.tone) +
            (ridgeRising[i][col] ? (dark ? 0.04 : 0.08) : -0.03) +
            grain[rowStart + Math.min(stride - 1, col + shift + 40)] * 0.08 -
            (y - top) * 0.0018;
          if (i === 0 && y - top < 6 && top < 90) tone += dark ? 0.15 : 0.3; // rim light on the far ridge
          if (dark && y - top < 2.4 && i < 3) tone += 0.35; // moonlit edges
          break;
        }

        const colour = tone > BAYER_8[(row & 7) * 8 + (col & 7)] ? paper : ink;
        const at = (row * cols + col) * 4;
        data[at] = colour[0];
        data[at + 1] = colour[1];
        data[at + 2] = colour[2];
        data[at + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
  };

  return { resize, draw };
}

export function Banner({ dark, quote }: { dark: boolean; quote: string }) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef<Pointer>({ x: 0, smoothed: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const renderer = createRenderer(container, canvas, dark, pointer.current);
    if (!renderer) return;

    renderer.resize();
    renderer.draw(0);

    let frame = 0;
    let lastPainted = 0;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (now - lastPainted < FRAME_INTERVAL_MS) return;
      lastPainted = now;
      renderer.draw(now);
    };
    const start = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    // Animate only while the banner is on screen, and not at all for visitors who prefer reduced motion.
    const observer = reducedMotion ? null : new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    observer?.observe(container);

    const resizeObserver = new ResizeObserver(() => {
      renderer.resize();
      renderer.draw(performance.now());
    });
    resizeObserver.observe(container);

    return () => {
      stop();
      observer?.disconnect();
      resizeObserver.disconnect();
    };
  }, [dark, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative h-[180px] overflow-hidden sm:h-[216px]"
      onPointerMove={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        pointer.current.x = (event.clientX - box.left) / box.width - 0.5;
      }}
      onPointerLeave={() => {
        pointer.current.x = 0;
      }}
    >
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" style={{ imageRendering: "pixelated" }} />
      <p
        className="absolute left-1/2 top-[30%] m-0 max-w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-[14px] px-4 py-1.5 text-center text-[14px] italic sm:text-[15px]"
        style={{
          fontFamily: TEXT_FONT,
          color: dark ? "#e7ece9" : "#1c2621",
          background: dark ? "rgba(8,10,9,.62)" : "rgba(238,235,226,.78)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          boxShadow: dark ? "inset 0 0 0 1px rgba(255,255,255,.08)" : "inset 0 0 0 1px rgba(28,38,33,.08)",
        }}
      >
        {quote}
      </p>
    </div>
  );
}
