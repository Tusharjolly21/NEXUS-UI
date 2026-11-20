"use client";

import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

export type DitherFieldProps = {
  /** Colour of the lit dots. */
  foreground?: string;
  /** Colour of the unlit dots. */
  background?: string;
  /** Size of one dot in CSS pixels. Bigger looks chunkier and costs less. */
  cellSize?: number;
  /** How fast the field drifts. 1 is the default pace. */
  speed?: number;
  /** Pointer lights up the dots under it, and a press sends out a ring. */
  interactive?: boolean;
  /** A ghost pointer wanders over the field by itself until the visitor touches it. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Anything to place on top of the field, such as a headline. */
  children?: ReactNode;
  className?: string;
};

type Ring = { x: number; y: number; at: number };

/** 8 x 8 Bayer matrix, scaled to 0..1. A pixel is lit when the field value is above its threshold. */
const BAYER = (() => {
  let m = [[0]];
  for (let n = 1; n < 8; n *= 2) {
    const next: number[][] = [];
    for (let y = 0; y < n * 2; y++) {
      next.push([]);
      for (let x = 0; x < n * 2; x++) {
        const base = 4 * m[y % n][x % n];
        const add = y < n ? (x < n ? 0 : 2) : x < n ? 3 : 1;
        next[y].push(base + add);
      }
    }
    m = next;
  }
  return m.map((row) => row.map((v) => (v + 0.5) / 64));
})();

/** "#rrggbb" or "#rgb" to a packed little-endian RGBA value for a Uint32Array over ImageData. */
function pack(hex: string) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h.padEnd(6, "0").slice(0, 6), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
}

/**
 * A field of dots that shimmers between two colours, the way old screens faked shades with only two.
 * Every frame, a soft moving pattern is compared with a fixed grid of thresholds, so each dot is on or off and
 * the shades appear from the pattern of dots. The pointer brightens the dots under it and a press sends out a ring.
 */
export default function DitherField({
  foreground = "#1d1d1f",
  background = "#f5f5f7",
  cellSize = 4,
  speed = 1,
  interactive = true,
  autoplay = false,
  children,
  className = "",
}: DitherFieldProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: -9999, y: -9999, active: false });
  const rings = useRef<Ring[]>([]);
  const touched = useRef(false);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fg = pack(foreground);
    const bg = pack(background);
    let cols = 0;
    let rows = 0;
    let image: ImageData | null = null;
    let pixels: Uint32Array | null = null;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let clock = 0;

    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      cols = Math.max(1, Math.ceil(width / cellSize));
      rows = Math.max(1, Math.ceil(height / cellSize));
      cv.width = cols;
      cv.height = rows;
      image = ctx.createImageData(cols, rows);
      pixels = new Uint32Array(image.data.buffer);
      draw();
    };

    const draw = () => {
      if (!image || !pixels) return;
      const t = clock * speed;
      const now = performance.now();
      const p = pointer.current;
      const live = rings.current.filter((r) => now - r.at < 1800);
      rings.current = live;
      for (let y = 0; y < rows; y++) {
        const py = y * cellSize;
        const rowBayer = BAYER[y & 7];
        for (let x = 0; x < cols; x++) {
          const px = x * cellSize;
          let v =
            0.5 +
            0.22 * Math.sin(px * 0.012 + t * 0.9) +
            0.22 * Math.sin(py * 0.015 - t * 0.7 + Math.sin(px * 0.006 + t * 0.5) * 2.2);
          if (p.active) {
            const dx = px - p.x;
            const dy = py - p.y;
            v += 0.5 * Math.exp(-(dx * dx + dy * dy) / (2 * 90 * 90));
          }
          for (let i = 0; i < live.length; i++) {
            const r = live[i];
            const age = (now - r.at) / 1000;
            const radius = age * 360;
            const d = Math.hypot(px - r.x, py - r.y);
            const k = (d - radius) / 26;
            v += 0.42 * Math.exp(-k * k) * (1 - age / 1.8);
          }
          pixels[y * cols + x] = v > rowBayer[x & 7] ? fg : bg;
        }
      }
      ctx.putImageData(image, 0, 0);
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible || document.hidden) return;
      clock += dt;
      if (autoplay && !touched.current && interactive) {
        const { width, height } = el.getBoundingClientRect();
        pointer.current = {
          x: width * (0.5 + 0.34 * Math.sin(clock * 0.8)),
          y: height * (0.5 + 0.3 * Math.sin(clock * 1.1 + 1)),
          active: true,
        };
      }
      draw();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(el);
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      if (!reducedQuery.matches) raf = requestAnimationFrame(frame);
      else draw();
    };
    start();
    reducedQuery.addEventListener("change", start);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      reducedQuery.removeEventListener("change", start);
    };
  }, [foreground, background, cellSize, speed, interactive, autoplay]);

  const local = (e: ReactPointerEvent) => {
    const rect = wrap.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <div
      ref={wrap}
      className={`relative isolate overflow-hidden rounded-[24px] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
      style={{ background, touchAction: interactive ? "pan-y" : undefined }}
      onPointerMove={
        interactive
          ? (e) => {
              touched.current = true;
              pointer.current = { ...local(e), active: true };
            }
          : undefined
      }
      onPointerLeave={interactive ? () => (pointer.current = { ...pointer.current, active: false }) : undefined}
      onPointerDown={
        interactive
          ? (e) => {
              touched.current = true;
              const { x, y } = local(e);
              pointer.current = { x, y, active: true };
              rings.current.push({ x, y, at: performance.now() });
            }
          : undefined
      }
    >
      <canvas
        ref={canvas}
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-full w-full"
        style={{ imageRendering: "pixelated" }}
      />
      {children}
    </div>
  );
}
