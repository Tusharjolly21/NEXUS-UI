# Cubes Grid

Add the "Cubes Grid" component from Nexus UI to my project.

A field of 3D cubes that ripples under the cursor. Moving the pointer lifts cubes into a travelling wave that spreads, bounces off the edges and settles on its own. Pick a flat light isometric floor with soft crest highlights, or a dark tilted grid fading into fog with glowing crests. One canvas and one animation loop, no re-renders.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. It is styled with Tailwind CSS classes, so the project needs Tailwind.
3. Use it like this: `import { CubesGrid } from "@/components/cubes-grid";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/cubes-grid/cubes-grid.tsx ---

```tsx
"use client";

import * as React from "react";

/**
 * Cubes Grid: a field of 3D cubes that ripples under the cursor.
 *
 * - `variant="isometric"`: a flat, light isometric floor. Moving the pointer pushes cubes up into a
 *   travelling wave, their side faces appear, and the crests catch a soft light.
 * - `variant="perspective"`: a dark grid of cubes on a tilted plane fading into fog. Crests rise
 *   and glow in `waveColor`.
 *
 * The heights come from a small 2D wave equation (each cube pulls on its four neighbours), so the
 * rings spread, bounce and settle on their own. Everything is drawn on one canvas in a single
 * requestAnimationFrame loop; React never re-renders while it runs.
 *
 * It fills its nearest positioned parent (absolute inset-0). Put it in a `relative` container and
 * place content above it. It listens to the pointer on the window, so content on top does not
 * block the ripples. It pauses off screen and holds still for people who prefer reduced motion.
 */
export type CubesGridProps = {
  /** Drops random ripples while the pointer is idle, so the grid demos itself (same as idleRipples, and wins over it when set). */
  autoplay?: boolean;
  /** Picks the flat isometric field or the tilted 3D grid. */
  variant?: "isometric" | "perspective";
  className?: string;
  /** Wave height. Isometric: in tiles (default 0.7). Perspective: in cube sizes (default 0.9). */
  amplitude?: number;
  /** Strength of the light on the wave crests. 0 turns it off. */
  glow?: number;
  /** Drops random ripples when the pointer stops. */
  idleRipples?: boolean;
  /** Seconds the grid stays still before random ripples start. */
  idleDelay?: number;
  /** Wave speed, in cubes per second. */
  speed?: number;
  /** Wave energy kept per second (0 to 1). Lower settles faster. */
  damping?: number;
  /** Seam between cubes. Isometric: fraction of a tile. Perspective: world units (default 0.16). */
  gap?: number;

  // isometric
  /** On-screen width of one tile, in px (isometric). */
  cellSize?: number;
  /** Top face colour (isometric). */
  topColor?: string;
  /** Left face colour (isometric). */
  leftColor?: string;
  /** Right face colour (isometric). */
  rightColor?: string;
  /** Colour of the light that follows the ripple (isometric). */
  glowColor?: string;

  // perspective
  /** Number of cubes per side (perspective). */
  gridSize?: number;
  /** Cube colour at rest (perspective). */
  baseColor?: string;
  /** Colour of the wave crests (perspective). */
  waveColor?: string;
  /** Scene background and fog colour (perspective). */
  backgroundColor?: string;
  /** Camera tilt away from top-down, in radians (perspective). */
  tilt?: number;
};

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const shade = (a: RGB, k: number): RGB => [a[0] * k, a[1] * k, a[2] * k];
const css = (c: RGB) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/** A square lattice of heights obeying the 2D wave equation, with clamped (reflecting) edges. */
class WaveField {
  n: number;
  h: Float32Array;
  v: Float32Array;
  constructor(n: number) {
    this.n = n;
    this.h = new Float32Array(n * n);
    this.v = new Float32Array(n * n);
  }
  step(dt: number, speed: number, keepPerSecond: number, restore = 5) {
    const { n, h, v } = this;
    const steps = Math.max(1, Math.ceil((speed * dt) / 0.45));
    const sdt = dt / steps;
    const c2 = speed * speed;
    const keep = Math.pow(clamp01(keepPerSecond), sdt);
    for (let s = 0; s < steps; s++) {
      for (let y = 0; y < n; y++) {
        const row = y * n;
        const up = (y > 0 ? y - 1 : y) * n;
        const down = (y < n - 1 ? y + 1 : y) * n;
        for (let x = 0; x < n; x++) {
          const i = row + x;
          const l = h[row + (x > 0 ? x - 1 : x)];
          const r = h[row + (x < n - 1 ? x + 1 : x)];
          const lap = l + r + h[up + x] + h[down + x] - 4 * h[i];
          // the -restore*h term pulls every cube back to the floor, so the grid always settles flat
          v[i] = (v[i] + (c2 * lap - restore * h[i]) * sdt) * keep;
        }
      }
      for (let i = 0; i < h.length; i++) h[i] += v[i] * sdt;
    }
  }
  /** Kick the velocity around (fx, fy) with a soft round brush. */
  poke(fx: number, fy: number, strength: number, radius = 1.4) {
    const { n, v } = this;
    const r = Math.ceil(radius * 2);
    const cx = Math.round(fx);
    const cy = Math.round(fy);
    for (let y = cy - r; y <= cy + r; y++) {
      if (y < 0 || y >= n) continue;
      for (let x = cx - r; x <= cx + r; x++) {
        if (x < 0 || x >= n) continue;
        const d2 = (x - fx) ** 2 + (y - fy) ** 2;
        v[y * n + x] += strength * Math.exp(-d2 / (radius * radius));
      }
    }
  }
}

export function CubesGrid({
  autoplay,
  variant = "isometric",
  className,
  amplitude,
  glow,
  idleRipples = true,
  idleDelay = 1.5,
  speed,
  damping,
  gap,
  cellSize = 150,
  topColor = "#fafaf9",
  leftColor = "#e7e5e4",
  rightColor = "#d6d3d1",
  glowColor = "#a8a29e",
  gridSize = 40,
  baseColor = "#2a2a30",
  waveColor = "#ff6a2b",
  backgroundColor = "#0b0b0d",
  tilt = 0.7,
}: CubesGridProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // keep the latest props in a ref so the loop never restarts on a prop change
  const iso = variant !== "perspective";
  const settings = {
    iso,
    amp: amplitude ?? (iso ? 0.7 : 0.9),
    glow: glow ?? (iso ? 0.5 : 0.9),
    speed: speed ?? (iso ? 7 : 9),
    keep: damping ?? (iso ? 0.08 : 0.1),
    gap: gap ?? (iso ? 0.025 : 0.16),
    idleRipples: autoplay ?? idleRipples,
    idleDelay,
    cellSize: Math.max(24, cellSize),
    top: hexToRgb(topColor),
    left: hexToRgb(leftColor),
    right: hexToRgb(rightColor),
    glowRgb: hexToRgb(glowColor),
    n: Math.max(8, Math.min(80, Math.round(gridSize))),
    base: hexToRgb(baseColor),
    wave: hexToRgb(waveColor),
    bg: hexToRgb(backgroundColor),
    tilt: Math.max(0, Math.min(1.3, tilt)),
  };
  const live = React.useRef(settings);
  // the loop reads the latest settings from here, so a prop change never restarts it
  React.useEffect(() => {
    live.current = settings;
  });

  const fieldKey = iso ? `iso` : `p-${settings.n}`;

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let field: WaveField | null = null;
    let R = 0; // isometric: lattice runs from -R..R on both axes

    const sizeField = () => {
      const s = live.current;
      if (s.iso) {
        const W = s.cellSize;
        const need = Math.ceil((w / W + (2 * h) / W) / 2) + 3;
        if (!field || need !== R) {
          R = need;
          field = new WaveField(2 * R + 1);
        }
      } else if (!field || field.n !== s.n) {
        field = new WaveField(s.n);
      }
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      sizeField();
      draw();
    };

    // ---------- projection helpers ----------
    const persp = () => {
      const s = live.current;
      const N = s.n;
      const t = s.tilt;
      const D = N * 0.75;
      const sinT = Math.sin(t);
      const cosT = Math.cos(t);
      // zoom so even the far rows span the full width; near rows simply run off the sides
      const f = (w * (D + (N / 2) * sinT)) / (N * 0.94);
      const cx = w / 2;
      const cy = h * 0.42;
      return { N, D, sinT, cosT, f, cx, cy };
    };

    /** Screen point -> lattice coordinates (fractional), or null when off the grid. */
    const toCell = (px: number, py: number): [number, number] | null => {
      const s = live.current;
      if (!field) return null;
      if (s.iso) {
        const half = s.cellSize / 2;
        const a = (px - w / 2) / half;
        const b = (py - h / 2) / (s.cellSize / 4);
        const i = (a + b) / 2;
        const j = (b - a) / 2;
        return [i + R, j + R];
      }
      const p = persp();
      const sx = (px - p.cx) / p.f;
      const sy = (py - p.cy) / p.f;
      const den = p.cosT + sy * p.sinT;
      if (den <= 0.05) return null;
      const Z = (sy * p.D) / den;
      const X = sx * (p.D - Z * p.sinT);
      const half = (p.N - 1) / 2;
      return [X + half, Z + half];
    };

    // ---------- drawing ----------
    const drawIso = () => {
      const s = live.current;
      const f = field!;
      const W = s.cellSize;
      const half = W / 2;
      const q = W / 4;
      const ex = half * (1 - s.gap);
      const ey = q * (1 - s.gap);
      const unit = half; // screen px per tile of height
      const n = f.n;
      ctx.fillStyle = css(shade(s.left, 0.92));
      ctx.fillRect(0, 0, w, h);
      for (let sum = -2 * R; sum <= 2 * R; sum++) {
        const iMin = Math.max(-R, sum - R);
        const iMax = Math.min(R, sum + R);
        for (let i = iMin; i <= iMax; i++) {
          const j = sum - i;
          const cx = w / 2 + (i - j) * half;
          const baseY = h / 2 + (i + j) * q;
          if (cx < -W || cx > w + W || baseY < -W * 2 || baseY > h + W * 2) continue;
          const z = Math.tanh(f.h[(j + R) * n + (i + R)]) * s.amp;
          const cy = baseY - z * unit;
          const depth = (z + 1) * unit; // sides reach below the floor so holes read as holes
          const crest = clamp01(z * s.glow * 1.6);
          const trough = clamp01(-z * 0.8);
          const top = mix(mix(s.top, s.glowRgb, crest), s.left, trough);

          // left face
          ctx.fillStyle = css(mix(s.left, s.glowRgb, crest * 0.35));
          ctx.beginPath();
          ctx.moveTo(cx - ex, cy);
          ctx.lineTo(cx, cy + ey);
          ctx.lineTo(cx, cy + ey + depth);
          ctx.lineTo(cx - ex, cy + depth);
          ctx.closePath();
          ctx.fill();
          // right face
          ctx.fillStyle = css(mix(s.right, s.glowRgb, crest * 0.25));
          ctx.beginPath();
          ctx.moveTo(cx, cy + ey);
          ctx.lineTo(cx + ex, cy);
          ctx.lineTo(cx + ex, cy + depth);
          ctx.lineTo(cx, cy + ey + depth);
          ctx.closePath();
          ctx.fill();
          // top face
          ctx.fillStyle = css(top);
          ctx.beginPath();
          ctx.moveTo(cx, cy - ey);
          ctx.lineTo(cx + ex, cy);
          ctx.lineTo(cx, cy + ey);
          ctx.lineTo(cx - ex, cy);
          ctx.closePath();
          ctx.fill();
        }
      }
    };

    const drawPersp = () => {
      const s = live.current;
      const f = field!;
      const p = persp();
      const N = p.N;
      const halfN = (N - 1) / 2;
      const size = 1 - s.gap;
      const hs = size / 2;
      ctx.fillStyle = css(s.bg);
      ctx.fillRect(0, 0, w, h);
      const nearDepth = p.D - halfN * p.sinT;
      const farDepth = p.D + halfN * p.sinT;

      const proj = (X: number, Y: number, Z: number, out: number[], k: number) => {
        const yp = Y * p.cosT + Z * p.sinT;
        const zp = -Y * p.sinT + Z * p.cosT;
        const d = p.D - yp;
        out[k] = p.cx + (p.f * X) / d;
        out[k + 1] = p.cy + (p.f * zp) / d;
      };
      const pts = new Array(16).fill(0);
      const quad = (a: number, b: number, c: number, d: number) => {
        ctx.beginPath();
        ctx.moveTo(pts[a], pts[a + 1]);
        ctx.lineTo(pts[b], pts[b + 1]);
        ctx.lineTo(pts[c], pts[c + 1]);
        ctx.lineTo(pts[d], pts[d + 1]);
        ctx.closePath();
      };

      // far rows first; inside a row, outer cubes first so inner side faces land on top
      const order: number[] = [];
      for (let k = 0; k < N; k++) order.push(k);
      order.sort((a, b) => Math.abs(b - halfN) - Math.abs(a - halfN));

      for (let row = 0; row < N; row++) {
        const Z = row - halfN;
        const rowDepth = p.D - Z * p.sinT;
        const fog = clamp01((rowDepth - nearDepth) / (farDepth - nearDepth));
        const fogK = fog * fog * 0.95;
        for (const col of order) {
          const X = col - halfN;
          const v = Math.tanh(f.h[row * N + col]);
          const T = v * s.amp;
          const B = T - 1;
          const crest = clamp01((v * s.glow) / 0.9);
          const body = mix(s.base, s.wave, crest);
          const emit = crest * s.glow * 0.6;
          const lit = (c: RGB, k: number) => mix(mix(shade(c, k), [255, 255, 255], emit * 0.35), s.bg, fogK);

          // corners: 0 top-far-left, 2 top-far-right, 4 top-near-right, 6 top-near-left, 8.. bottoms
          proj(X - hs, T, Z - hs, pts, 0);
          proj(X + hs, T, Z - hs, pts, 2);
          proj(X + hs, T, Z + hs, pts, 4);
          proj(X - hs, T, Z + hs, pts, 6);
          proj(X + hs, B, Z + hs, pts, 8);
          proj(X - hs, B, Z + hs, pts, 10);
          proj(X + hs, B, Z - hs, pts, 12);
          proj(X - hs, B, Z - hs, pts, 14);

          if (pts[1] > h + 40 && pts[11] > h + 40) continue;
          if (pts[4] < -40 || pts[6] > w + 40) continue;

          // side face toward the centre of view
          ctx.fillStyle = css(lit(body, 0.62));
          if (X < 0) quad(2, 4, 8, 12);
          else quad(0, 6, 10, 14);
          ctx.fill();
          // front face
          ctx.fillStyle = css(lit(body, 0.78));
          quad(6, 4, 8, 10);
          ctx.fill();
          // top face, with a lighter rim for a bevelled edge
          const topCol = lit(body, 1.18);
          ctx.fillStyle = css(topCol);
          quad(0, 2, 4, 6);
          ctx.fill();
          ctx.strokeStyle = css(mix(topCol, [255, 255, 255], 0.12 + emit * 0.2));
          ctx.lineWidth = Math.max(0.6, (p.f * 0.03) / rowDepth);
          ctx.lineJoin = "round";
          ctx.stroke();
        }
      }
    };

    const draw = () => {
      if (!field) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (live.current.iso) drawIso();
      else drawPersp();
    };

    // ---------- input ----------
    let lastMove = performance.now();
    let lastCell: [number, number] | null = null;
    let nextIdle = 0;

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      if (px < 0 || py < 0 || px > rect.width || py > rect.height) return;
      const cell = toCell(px, py);
      if (!cell || !field) return;
      lastMove = performance.now();
      const moved = lastCell ? Math.hypot(cell[0] - lastCell[0], cell[1] - lastCell[1]) : 1;
      lastCell = cell;
      if (moved < 0.15) return;
      const s = live.current;
      field.poke(cell[0], cell[1], Math.min(1, 0.45 + moved * 0.3) * s.speed * (s.iso ? 0.8 : 0.6), s.iso ? 1.1 : 1.3);
    };
    const onDown = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const cell = toCell(e.clientX - rect.left, e.clientY - rect.top);
      if (!cell || !field) return;
      const s = live.current;
      field.poke(cell[0], cell[1], 1.3 * s.speed, s.iso ? 1.6 : 2);
    };

    // ---------- loop ----------
    let raf = 0;
    let visible = true;
    let prev = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || !field) {
        prev = now;
        return;
      }
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const s = live.current;
      if (s.idleRipples && now - lastMove > s.idleDelay * 1000 && now > nextIdle) {
        const n = field.n;
        const lo = s.iso ? n * 0.3 : n * 0.15;
        const hi = s.iso ? n * 0.7 : n * 0.85;
        field.poke(lo + Math.random() * (hi - lo), lo + Math.random() * (hi - lo), 0.9 * s.speed, s.iso ? 1.4 : 1.8);
        nextIdle = now + 1100 + Math.random() * 900;
      }
      field.step(dt, s.speed, s.keep);
      draw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    if (reduced) {
      draw();
      return () => ro.disconnect();
    }

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { rootMargin: "100px" });
    io.observe(wrap);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
    // the lattice is rebuilt when its size changes; everything else is read live
  }, [fieldKey, settings.cellSize]);

  return (
    <div ref={wrapRef} aria-hidden="true" className={["pointer-events-none absolute inset-0 overflow-hidden", className].filter(Boolean).join(" ")}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
```

--- components/cubes-grid/index.ts ---

```ts
export { CubesGrid } from "./cubes-grid";
export type { CubesGridProps } from "./cubes-grid";
```
