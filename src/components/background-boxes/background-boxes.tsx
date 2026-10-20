"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface BackgroundBoxesProps {
  /** Number of rows in the grid. */
  rows?: number;
  /** Number of columns in the grid. */
  cols?: number;
  /** Width of one cell before the transform, in px. */
  boxWidth?: number;
  /** Height of one cell before the transform, in px. */
  boxHeight?: number;
  /** Grid line colour. Defaults to a hairline that suits the current theme. */
  borderColor?: string;
  /** Grid line width in px. */
  borderWidth?: number;
  /** Small plus marks at every other intersection. */
  showCrosses?: boolean;
  /** Colour of the plus marks. Defaults to a theme-aware grey. */
  crossColor?: string;
  /** Colours a cell can light up in when it pops. */
  hoverColors?: string[];
  /** CSS-style skewX of the grid, in degrees. */
  skewX?: number;
  /** CSS-style skewY of the grid, in degrees. */
  skewY?: number;
  /** Scale of the grid. */
  scale?: number;
  /** Rotation of the grid, in degrees. */
  rotation?: number;
  /** Pans the grid sideways by a percentage of the container width. */
  translateX?: number;
  /** Pans the grid vertically by a percentage of the container height. */
  translateY?: number;
  /** Runs a pretend pointer across the grid until someone moves over it. */
  autoplay?: boolean;
  /** Content drawn above the grid. */
  children?: ReactNode;
  className?: string;
}

const DEFAULT_HOVER_COLORS = ["#0a84ff", "#30d158", "#ff9f0a", "#bf5af2", "#ff375f", "#64d2ff", "#ffd60a"];

type Cell = { h: number; v: number; target: number; e: number; color: string };

function subscribeTheme(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
/** Follows the site's class-based dark mode; false on the server and during hydration. */
function useIsDark() {
  return useSyncExternalStore(subscribeTheme, () => document.documentElement.classList.contains("dark"), () => false);
}

/**
 * An isometric grid drawn on canvas. The cell under the pointer pops up like
 * a key in one of the hover colours, overshoots and settles, and a ripple
 * nudges the cells around it. Leave and everything drops back into the grid.
 */
export function BackgroundBoxes({
  rows = 60,
  cols = 60,
  boxWidth = 64,
  boxHeight = 32,
  borderColor,
  borderWidth = 1,
  showCrosses = true,
  crossColor,
  hoverColors = DEFAULT_HOVER_COLORS,
  skewX = -48,
  skewY = 14,
  scale = 0.675,
  rotation = 0,
  translateX = 0,
  translateY = 0,
  autoplay = false,
  children,
  className,
}: BackgroundBoxesProps) {
  const still = useReducedMotion() === true;
  const dark = useIsDark();
  const darkRef = useRef(dark);
  const dirty = useRef(true);
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0, y: 0, inside: false });
  const touched = useRef(false);

  useEffect(() => {
    darkRef.current = dark;
    dirty.current = true;
  }, [dark]);

  // The live loop reads darkRef; a still frame has to be redrawn when the theme flips.
  const stillTheme = still ? dark : null;
  const R = Math.max(2, Math.min(200, Math.round(rows)));
  const C = Math.max(2, Math.min(200, Math.round(cols)));
  const bw = Math.max(4, boxWidth);
  const bh = Math.max(4, boxHeight);
  // Join so an inline array literal doesn't restart the loop on every render.
  const palette = (hoverColors.length ? hoverColors : DEFAULT_HOVER_COLORS).join("|");

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const colors = palette.split("|");

    const t = (d: number) => Math.tan((d * Math.PI) / 180);
    const ax = t(skewX);
    const ay = t(skewY);
    const rr = (rotation * Math.PI) / 180;
    const cr = Math.cos(rr);
    const sr = Math.sin(rr);
    // M = skewX · skewY · scale · rotate, the same order as the CSS transform list.
    const a = (1 + ax * ay) * scale;
    const b = ax * scale;
    const c = ay * scale;
    const d = scale;
    const m00 = a * cr + b * sr;
    const m01 = -a * sr + b * cr;
    const m10 = c * cr + d * sr;
    const m11 = -c * sr + d * cr;
    const det = m00 * m11 - m01 * m10 || 1e-6;
    const gw = C * bw;
    const gh = R * bh;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let ox = 0;
    let oy = 0;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ox = w / 2 + (translateX / 100) * w;
      oy = h / 2 + (translateY / 100) * h;
      dirty.current = true;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    const px = (u: number, v: number) => ox + m00 * (u - gw / 2) + m01 * (v - gh / 2);
    const py = (u: number, v: number) => oy + m10 * (u - gw / 2) + m11 * (v - gh / 2);
    const cellAt = (x: number, y: number) => {
      const dx = x - ox;
      const dy = y - oy;
      const u = (m11 * dx - m01 * dy) / det + gw / 2;
      const v = (-m10 * dx + m00 * dy) / det + gh / 2;
      const col = Math.floor(u / bw);
      const row = Math.floor(v / bh);
      return col < 0 || row < 0 || col >= C || row >= R ? -1 : row * C + col;
    };

    const cells = new Map<number, Cell>();
    const kicks: { key: number; at: number; v: number }[] = [];
    const lift = 9 + bh * scale * 0.35;
    let seed = 7;
    const pick = () => {
      seed = (seed * 16807) % 2147483647;
      return colors[seed % colors.length];
    };
    const touch = (key: number, e: number) => {
      let cell = cells.get(key);
      if (!cell) {
        cell = { h: 0, v: 0, target: 0, e: 0, color: pick() };
        cells.set(key, cell);
      }
      cell.e = Math.max(cell.e, e);
      return cell;
    };

    const draw = () => {
      const isDark = darkRef.current;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = borderColor ?? (isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)");
      ctx.beginPath();
      for (let j = 0; j <= R; j++) {
        ctx.moveTo(px(0, j * bh), py(0, j * bh));
        ctx.lineTo(px(gw, j * bh), py(gw, j * bh));
      }
      for (let i = 0; i <= C; i++) {
        ctx.moveTo(px(i * bw, 0), py(i * bw, 0));
        ctx.lineTo(px(i * bw, gh), py(i * bw, gh));
      }
      ctx.stroke();

      if (showCrosses) {
        ctx.strokeStyle = crossColor ?? (isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.2)");
        ctx.beginPath();
        for (let j = 0; j <= R; j += 2) {
          for (let i = 0; i <= C; i += 2) {
            const x = px(i * bw, j * bh);
            const y = py(i * bw, j * bh);
            if (x < -8 || y < -8 || x > w + 8 || y > h + 8) continue;
            ctx.moveTo(x - 4, y);
            ctx.lineTo(x + 4, y);
            ctx.moveTo(x, y - 4);
            ctx.lineTo(x, y + 4);
          }
        }
        ctx.stroke();
      }

      // Painter's order: cells further up the screen first.
      const list = [...cells.entries()].map(([key, cell]) => {
        const col = key % C;
        const row = (key - col) / C;
        const u0 = col * bw;
        const v0 = row * bh;
        const pts = [
          [px(u0, v0), py(u0, v0)],
          [px(u0 + bw, v0), py(u0 + bw, v0)],
          [px(u0 + bw, v0 + bh), py(u0 + bw, v0 + bh)],
          [px(u0, v0 + bh), py(u0, v0 + bh)],
        ];
        const cy = (pts[0][1] + pts[2][1]) / 2;
        return { cell, pts, cy, cx: (pts[0][0] + pts[2][0]) / 2 };
      });
      list.sort((p, q) => p.cy - q.cy);
      for (const { cell, pts, cx, cy } of list) {
        const up = Math.max(-3, cell.h);
        const k = Math.max(0, Math.min(1, cell.h / lift));
        const poly = (p: number[][], dy: number) => {
          ctx.beginPath();
          ctx.moveTo(p[0][0], p[0][1] - dy);
          for (let i = 1; i < 4; i++) ctx.lineTo(p[i][0], p[i][1] - dy);
          ctx.closePath();
        };
        // Shadow in the hole the cell lifted out of.
        poly(pts, 0);
        ctx.fillStyle = `rgba(0,0,0,${(isDark ? 0.45 : 0.14) * k})`;
        ctx.fill();
        // Side walls on the edges that face down the screen.
        if (up > 0.5) {
          for (let i = 0; i < 4; i++) {
            const p = pts[i];
            const q = pts[(i + 1) % 4];
            if ((p[1] + q[1]) / 2 - cy <= 0) continue;
            ctx.beginPath();
            ctx.moveTo(p[0], p[1]);
            ctx.lineTo(q[0], q[1]);
            ctx.lineTo(q[0], q[1] - up);
            ctx.lineTo(p[0], p[1] - up);
            ctx.closePath();
            ctx.globalAlpha = Math.min(1, cell.e + 0.25);
            ctx.fillStyle = cell.color;
            ctx.fill();
            ctx.fillStyle = (p[0] + q[0]) / 2 < cx ? "rgba(0,0,0,0.38)" : "rgba(0,0,0,0.2)";
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }
        poly(pts, up);
        ctx.globalAlpha = Math.min(1, cell.e);
        ctx.fillStyle = cell.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = `rgba(255,255,255,${0.35 * cell.e})`;
        ctx.stroke();
      }
    };

    if (still) {
      draw();
      return () => ro.disconnect();
    }

    let raf = 0;
    let last = performance.now();
    let time = 0;
    let hovered = -1;
    let wasDark = darkRef.current;
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e?.isIntersecting ?? true;
    });
    io.observe(cv);

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;
      time += dt;
      if (darkRef.current !== wasDark) {
        wasDark = darkRef.current;
        dirty.current = true;
      }

      let at = -1;
      const p = pointer.current;
      if (p.inside) at = cellAt(p.x, p.y);
      else if (autoplay && !touched.current) {
        at = cellAt(w * (0.5 + 0.36 * Math.sin(time * 0.8)), h * (0.5 + 0.3 * Math.sin(time * 1.25 + 1)));
      }
      if (at !== hovered) {
        if (hovered >= 0) {
          const prev = cells.get(hovered);
          if (prev) prev.target = 0;
        }
        hovered = at;
        if (at >= 0) {
          const cell = touch(at, 1);
          cell.target = lift;
          cell.color = pick();
          const col = at % C;
          const row = (at - col) / C;
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              const ring = Math.max(Math.abs(dr), Math.abs(dc));
              const r2 = row + dr;
              const c2 = col + dc;
              if (ring === 0 || r2 < 0 || c2 < 0 || r2 >= R || c2 >= C) continue;
              kicks.push({ key: r2 * C + c2, at: time + ring * 0.07, v: ring === 1 ? 70 : 34 });
            }
          }
        }
      }

      for (let i = kicks.length - 1; i >= 0; i--) {
        if (kicks[i].at > time) continue;
        const k = kicks[i];
        kicks.splice(i, 1);
        const cell = touch(k.key, k.v > 50 ? 0.32 : 0.14);
        cell.v += k.v;
      }

      for (const [key, cell] of cells) {
        // Underdamped spring: pops past the target, then settles.
        cell.v += (190 * (cell.target - cell.h) - 11 * cell.v) * dt;
        cell.h += cell.v * dt;
        if (key !== hovered) cell.e = Math.max(0, cell.e - dt * 0.6);
        if (cell.target === 0 && cell.e === 0 && Math.abs(cell.h) < 0.05 && Math.abs(cell.v) < 0.5) cells.delete(key);
      }

      if (cells.size || dirty.current) {
        dirty.current = false;
        draw();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [stillTheme, still, R, C, bw, bh, borderColor, borderWidth, showCrosses, crossColor, palette, skewX, skewY, scale, rotation, translateX, translateY, autoplay]);

  return (
    <div
      ref={root}
      className={cn("relative overflow-hidden", className)}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        touched.current = true;
        pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top, inside: true };
      }}
      onPointerLeave={() => {
        pointer.current.inside = false;
      }}
    >
      <canvas
        ref={canvas}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_80%_75%_at_50%_50%,#000_45%,transparent)]"
      />
      {children ? <div className="relative z-10 h-full">{children}</div> : null}
    </div>
  );
}

export default BackgroundBoxes;
