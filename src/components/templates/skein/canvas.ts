"use client";

import { useEffect, useRef, type DependencyList, type RefObject } from "react";

/**
 * Canvas helpers shared by every particle scene on the page.
 *
 * `useCanvas` owns the boring parts (sizing for the screen's pixel density, pausing off screen and in
 * background tabs, following the theme, the pointer, reduced motion) so each scene is one draw function.
 * The shape helpers turn outlines into evenly spaced dots for the morphing glyph.
 */

export const TAU = Math.PI * 2;

export type Point = [number, number];

export type CanvasFrame = {
  ctx: CanvasRenderingContext2D;
  /** Canvas size in CSS pixels. */
  w: number;
  h: number;
  /** Seconds since the canvas mounted. */
  t: number;
  /** Seconds since the previous frame, capped at 50ms so a throttled tab never lurches. */
  dt: number;
  reduced: boolean;
  dark: boolean;
  /** The theme's ink colour as "r,g,b", ready for `rgba(${ink},.5)`. */
  ink: string;
  /** Pointer position relative to the canvas, and whether it is over it. */
  mouse: { x: number; y: number; on: boolean };
};

/** A theme token as "r,g,b" (the tokens are space-separated triplets). */
export function readToken(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--skein-${name}`).trim().replace(/\s+/g, ",");
}

function onThemeChange(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

/**
 * Runs `draw` once per frame for a canvas element, while it is on screen.
 *
 * - The latest `draw` closure is always used, so it can read props and state without re-subscribing.
 * - `deps` lists what should reset the loop (usually nothing).
 * - With reduced motion it draws a single settled frame, and again when the theme or size changes.
 */
export function useCanvas(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  draw: (frame: CanvasFrame) => void,
  deps: DependencyList = [],
) {
  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frame: CanvasFrame = {
      ctx,
      w: 0,
      h: 0,
      t: 0,
      dt: 0,
      reduced,
      dark: true,
      ink: "250,250,249",
      mouse: { x: -999, y: -999, on: false },
    };

    const readTheme = () => {
      frame.dark = document.documentElement.classList.contains("dark");
      frame.ink = readToken("ink");
    };
    readTheme();

    let visible = false;
    let raf = 0;
    const start = performance.now();
    let last = start;

    const render = (now: number) => {
      frame.dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      frame.t = (now - start) / 1000;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, frame.w, frame.h);
      drawRef.current(frame);
    };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      frame.w = canvas.clientWidth;
      frame.h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(frame.w * dpr));
      canvas.height = Math.max(1, Math.round(frame.h * dpr));
      if (reduced) render(performance.now());
    };

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { rootMargin: "120px" });
    intersection.observe(canvas);

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      frame.mouse.x = event.clientX - rect.left;
      frame.mouse.y = event.clientY - rect.top;
      frame.mouse.on = frame.mouse.x >= 0 && frame.mouse.y >= 0 && frame.mouse.x <= rect.width && frame.mouse.y <= rect.height;
    };
    const onPointerLeave = () => {
      frame.mouse.on = false;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) {
        last = now;
        return;
      }
      render(now);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const stopThemeWatch = onThemeChange(() => {
      readTheme();
      if (reduced) render(performance.now());
    });

    if (reduced) render(start + 4000);
    else raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      stopThemeWatch();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Seeded random numbers (FNV-1a hash into mulberry32), so every render and every visitor sees the same scene. */
export function seededRandom(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h += 1831565813;
    let n = h;
    n = Math.imul(n ^ (n >>> 15), n | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hue in degrees to "r,g,b" at the given saturation and lightness (HSL). */
export function hslToRgb(hue: number, saturation = 0.9, lightness = 0.66) {
  const k = (n: number) => (n + hue / 30) % 12;
  const a = saturation * Math.min(lightness, 1 - lightness);
  const channel = (n: number) => Math.round(255 * (lightness - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return `${channel(0)},${channel(8)},${channel(4)}`;
}

// ─── Outlines and the morphing glyph ─────────────────────────────────────────

/** Points along an arc (a full circle by default). */
export function arc(cx: number, cy: number, radius: number, from = 0, to = TAU, steps = 96): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = from + ((to - from) * i) / steps;
    points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  return points;
}

function roundedRect(x: number, y: number, width: number, height: number, radius: number): Point[] {
  const quarter = Math.PI / 2;
  return [
    ...arc(x + width - radius, y + radius, radius, -quarter, 0, 16),
    ...arc(x + width - radius, y + height - radius, radius, 0, quarter, 16),
    ...arc(x + radius, y + height - radius, radius, quarter, 2 * quarter, 16),
    ...arc(x + radius, y + radius, radius, 2 * quarter, 3 * quarter, 16),
    [x + width - radius, y],
  ];
}

function pathLength(points: Point[]) {
  return points.reduce((sum, p, i) => (i ? sum + Math.hypot(p[0] - points[i - 1][0], p[1] - points[i - 1][1]) : 0), 0);
}

/** Spreads `count` dots over several outlines, in proportion to each outline's length. */
function resample(outlines: Point[][], count: number): Point[] {
  const lengths = outlines.map(pathLength);
  const total = lengths.reduce((sum, n) => sum + n, 0);
  const dots: Point[] = [];
  outlines.forEach((outline, index) => {
    const share = index === outlines.length - 1 ? count - dots.length : Math.round((lengths[index] / total) * count);
    const length = lengths[index];
    let segment = 1;
    let walked = 0;
    for (let i = 0; i < share; i++) {
      const target = (i / share) * length;
      while (
        segment < outline.length - 1 &&
        walked + Math.hypot(outline[segment][0] - outline[segment - 1][0], outline[segment][1] - outline[segment - 1][1]) < target
      ) {
        walked += Math.hypot(outline[segment][0] - outline[segment - 1][0], outline[segment][1] - outline[segment - 1][1]);
        segment++;
      }
      const from = outline[segment - 1];
      const to = outline[segment];
      const span = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
      const u = Math.min(1, (target - walked) / span);
      dots.push([from[0] + (to[0] - from[0]) * u, from[1] + (to[1] - from[1]) * u]);
    }
  });
  return dots;
}

/** Two linked rings and a small node: "Trace". */
function traceOutline(): Point[][] {
  const a = [-0.5, -0.46, 0.25];
  const b = [0.04, 0.02, 0.38];
  const c = [0.54, 0.5, 0.21];
  const link = (from: number[], to: number[]): Point[] => {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const length = Math.hypot(dx, dy);
    return [
      [from[0] + (dx / length) * from[2], from[1] + (dy / length) * from[2]],
      [to[0] - (dx / length) * to[2], to[1] - (dy / length) * to[2]],
    ];
  };
  return [arc(a[0], a[1], a[2]), arc(b[0], b[1], b[2]), arc(c[0], c[1], c[2]), link(a, b), link(b, c), arc(b[0], b[1], 0.06, 0, TAU, 24)];
}

/** A speech bubble with three dots: "Ask". */
function askOutline(): Point[][] {
  return [
    roundedRect(-0.78, -0.56, 1.56, 0.94, 0.24),
    [
      [-0.42, 0.38],
      [-0.56, 0.72],
      [-0.16, 0.38],
    ],
    arc(-0.26, -0.09, 0.06, 0, TAU, 20),
    arc(0, -0.09, 0.06, 0, TAU, 20),
    arc(0.26, -0.09, 0.06, 0, TAU, 20),
  ];
}

/** Concentric rings with a sweep hand: "Watch". */
function watchOutline(): Point[][] {
  return [
    arc(0, 0, 0.8),
    arc(0, 0, 0.52),
    arc(0, 0, 0.24, 0, TAU, 48),
    [
      [0, 0],
      [0.57, -0.57],
    ],
  ];
}

const glyphCache = new Map<number, Point[][]>();

/**
 * The three product glyphs (Trace, Ask, Watch) as the same number of dots each, so one dot can travel from
 * its place in one glyph to its place in the next. Cached by dot count.
 */
export function glyphDots(count: number) {
  let dots = glyphCache.get(count);
  if (!dots) {
    dots = [resample(traceOutline(), count), resample(askOutline(), count), resample(watchOutline(), count)];
    glyphCache.set(count, dots);
  }
  return dots;
}
