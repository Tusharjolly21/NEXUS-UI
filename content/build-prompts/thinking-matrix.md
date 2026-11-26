# Thinking Matrix

Add the "Thinking Matrix" component from Nexus UI to my project.

A thinking pill with a tiny panel of lamps next to its label: a seven-by-seven grid of amber squares like an old instrument panel. Choose a pattern and the lamps play it: rings rippling out from the centre, a light winding in to the middle and back, sparks wandering the grid with fading trails, or two lights circling in opposite directions, while a warm highlight sweeps across the label.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { ThinkingMatrix } from "@/components/thinking-matrix";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/thinking-matrix/index.ts ---

```ts
export { default as ThinkingMatrix } from "./thinking-matrix";
export type { ThinkingMatrixProps } from "./thinking-matrix";
```

--- components/thinking-matrix/thinking-matrix.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs -- the animation state lives in refs on purpose: handlers, effects and animation frames read and write them, never the render itself */

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export type ThinkingPattern = "spiral" | "ripple" | "signals" | "orbit";
export type ThinkingMatrixProps = {
  label?: string;
  /** spiral: a light winds in to the centre and back out. ripple: rings out from the middle. signals: sparks wander the grid leaving trails. orbit: two lights circle in opposite directions */
  pattern?: ThinkingPattern;
  /** the colour of the lamps */
  tint?: "amber" | "ice" | "mint";
  /** 0.5 to 2 */
  speed?: number;
  className?: string;
};

const N = 7; // lamps per side
const L = 5,
  G = 1.6; // lamp size and gap
const SIZE = N * L + (N - 1) * G;
const TINTS = {
  amber: {
    off: [44, 22, 8],
    lo: [255, 118, 20],
    hi: [255, 226, 150],
    text: "#7a6c60",
    shine: "#ffe0b0",
  },
  ice: {
    off: [10, 22, 40],
    lo: [40, 130, 255],
    hi: [200, 240, 255],
    text: "#5f6c7c",
    shine: "#d8f0ff",
  },
  mint: {
    off: [8, 34, 24],
    lo: [30, 200, 130],
    hi: [210, 255, 225],
    text: "#5d7268",
    shine: "#d4ffe6",
  },
};

/**
 * A "thinking" pill with a tiny lamp panel that looks like it is thinking.
 *
 * Next to the label sits a seven-by-seven grid of little square lamps, the kind on an old instrument panel, each one
 * glowing amber when lit, hot yellow-white at its brightest, and a dim brown when off. Ripple sends rings of light out
 * from the centre lamp to the corners, each with an afterglow behind it. Spiral winds a light in round the squares to
 * the centre and back out, with a second, dimmer light half a turn behind it. Signals lets three or four sparks wander the
 * grid one lamp at a time, mostly straight on, sometimes turning, each leaving a fading trail, like impulses crossing
 * a circuit. Orbit runs two lights round the outer and inner squares in opposite directions. A warm highlight sweeps
 * across the label at the same time. Screen readers hear the label once, as a status.
 */
export default function ThinkingMatrix({
  label = "Thinking",
  pattern = "spiral",
  tint = "amber",
  speed = 1,
  className = "",
}: ThinkingMatrixProps) {
  const cv = useRef<HTMLCanvasElement>(null);
  const opts = useRef({ pattern, tint, speed });
  opts.current = { pattern, tint, speed };
  const T = TINTS[tint];

  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const g = c.getContext("2d");
    if (!g) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const PADC = 8;
    const CS = SIZE + PADC * 2;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    c.width = CS * dpr;
    c.height = CS * dpr;
    const heat = new Float32Array(N * N); // for signals and orbit: how lit each lamp is
    type Head = { x: number; y: number; dx: number; dy: number };
    const heads: Head[] = [];
    const spawn = (): Head => {
      const side = Math.floor(Math.random() * 4);
      const p = Math.floor(Math.random() * N);
      return side === 0
        ? { x: 0, y: p, dx: 1, dy: 0 }
        : side === 1
          ? { x: N - 1, y: p, dx: -1, dy: 0 }
          : side === 2
            ? { x: p, y: 0, dx: 0, dy: 1 }
            : { x: p, y: N - 1, dx: 0, dy: -1 };
    };
    for (let i = 0; i < 4; i++) heads.push(spawn());
    let raf = 0,
      last = performance.now(),
      t = 0,
      acc = 0,
      visible = true;
    // the rings of the grid, for orbit
    const ring = (k: number) => {
      const out: [number, number][] = [];
      const a = k,
        b = N - 1 - k;
      for (let x = a; x < b; x++) out.push([x, a]);
      for (let y = a; y < b; y++) out.push([b, y]);
      for (let x = b; x > a; x--) out.push([x, b]);
      for (let y = b; y > a; y--) out.push([a, y]);
      return out;
    };
    const outer = ring(0),
      inner = ring(2);
    const spiral = [
      ...ring(0),
      ...ring(1),
      ...ring(2),
      [3, 3] as [number, number],
    ];

    const lamp = (x: number, y: number, v: number) => {
      const px = PADC + x * (L + G),
        py = PADC + y * (L + G);
      v = Math.max(0, Math.min(1.2, v));
      const o = T.off,
        lo = T.lo,
        hi = T.hi;
      let col: number[];
      if (v < 0.04) col = o;
      else if (v < 0.75) {
        const k = v / 0.75;
        col = [
          o[0] + (lo[0] - o[0]) * k,
          o[1] + (lo[1] - o[1]) * k,
          o[2] + (lo[2] - o[2]) * k,
        ];
      } else {
        const k = Math.min(1, (v - 0.75) / 0.4);
        col = [
          lo[0] + (hi[0] - lo[0]) * k,
          lo[1] + (hi[1] - lo[1]) * k,
          lo[2] + (hi[2] - lo[2]) * k,
        ];
      }
      if (v > 0.08) {
        const r = L * (1.2 + v * 0.9);
        const gr = g.createRadialGradient(
          px + L / 2,
          py + L / 2,
          0,
          px + L / 2,
          py + L / 2,
          r,
        );
        gr.addColorStop(
          0,
          `rgba(${lo[0]},${lo[1]},${lo[2]},${0.32 * Math.min(1, v)})`,
        );
        gr.addColorStop(1, `rgba(${lo[0]},${lo[1]},${lo[2]},0)`);
        g.globalCompositeOperation = "lighter";
        g.fillStyle = gr;
        g.fillRect(px + L / 2 - r, py + L / 2 - r, r * 2, r * 2);
        g.globalCompositeOperation = "source-over";
      }
      g.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`;
      g.beginPath();
      g.roundRect(px, py, L, L, 1.4);
      g.fill();
    };

    const frame = (now: number) => {
      const o = opts.current;
      const dt =
        Math.min(0.05, (now - last) / 1000) *
        Math.max(0.5, Math.min(2, o.speed));
      last = now;
      t += dt;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, CS, CS);
      const mid = (N - 1) / 2;
      if (o.pattern === "ripple") {
        const period = 1.15;
        const ph = (t % period) / period;
        const R = ph * 5.2 - 0.3;
        for (let y = 0; y < N; y++)
          for (let x = 0; x < N; x++) {
            const d = Math.hypot(x - mid, y - mid);
            const front = Math.exp(-Math.pow((d - R) / 0.62, 2));
            const after = d < R ? Math.exp(-(R - d) / 1.1) * 0.32 : 0;
            const corner =
              d > 4 ? 0.18 * Math.exp(-Math.pow((ph - 0.95) / 0.12, 2)) : 0;
            const v =
              front * (1.15 - d * 0.06) + after + corner + (d < 0.5 ? 0.15 : 0);
            lamp(x, y, v);
          }
      } else {
        // signals and orbit both leave heat behind that cools
        const cool = Math.exp(-dt / 0.2);
        for (let i = 0; i < heat.length; i++) heat[i] *= cool;
        acc += dt;
        const stepT =
          o.pattern === "signals"
            ? 0.085
            : o.pattern === "spiral"
              ? 0.042
              : 0.07;
        while (acc >= stepT) {
          acc -= stepT;
          if (o.pattern === "signals") {
            for (let k = 0; k < heads.length; k++) {
              const h = heads[k];
              if (Math.random() < 0.22) {
                // turn left or right
                const s = Math.random() < 0.5 ? 1 : -1;
                const ndx = -h.dy * s,
                  ndy = h.dx * s;
                h.dx = ndx;
                h.dy = ndy;
              }
              h.x += h.dx;
              h.y += h.dy;
              if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N)
                heads[k] = spawn();
              const hh = heads[k];
              heat[hh.y * N + hh.x] = 1.2;
            }
          } else if (o.pattern === "spiral") {
            // in along the square spiral to the centre, then back out, with a second light half a turn behind
            const n = spiral.length,
              k = Math.floor(t / stepT) % (n * 2 - 2);
            const i = k < n ? k : n * 2 - 2 - k;
            const [x1, y1] = spiral[i];
            heat[y1 * N + x1] = 1.2;
            const j = (i + Math.floor(n / 2)) % n;
            const [x2, y2] = spiral[j];
            heat[y2 * N + x2] = Math.max(heat[y2 * N + x2], 0.7);
          } else {
            const i1 = Math.floor(t / stepT) % outer.length;
            const i2 =
              (inner.length * 4 - (Math.floor(t / stepT) % inner.length)) %
              inner.length;
            const [x1, y1] = outer[i1];
            const [x2, y2] = inner[i2];
            heat[y1 * N + x1] = 1.2;
            heat[y2 * N + x2] = 1.05;
            heat[3 * N + 3] = Math.max(
              heat[3 * N + 3],
              0.35 + 0.3 * Math.sin(t * 6),
            );
          }
        }
        for (let y = 0; y < N; y++)
          for (let x = 0; x < N; x++) lamp(x, y, heat[y * N + x]);
      }
      raf = visible && !reduce ? requestAnimationFrame(frame) : 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf && !reduce) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(c);
    if (reduce) {
      t = 0.45;
      frame(performance.now());
    } else raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tint]);

  return (
    <div
      role="status"
      className={`inline-flex h-[54px] items-center gap-3 rounded-[20px] bg-[#070707] pl-[18px] pr-6 shadow-[0_10px_30px_-12px_rgba(0,0,0,.6),inset_0_1px_0_rgba(255,255,255,.05),inset_0_0_0_1px_rgba(255,255,255,.04)] ${className}`}
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif",
      }}
    >
      <canvas
        ref={cv}
        aria-hidden="true"
        style={{ width: SIZE + 16, height: SIZE + 16, margin: -8 }}
      />
      <motion.span
        className="text-[19px] font-medium tracking-[-0.01em]"
        style={{
          backgroundImage: `linear-gradient(90deg, ${T.text} 0%, ${T.text} 38%, ${T.shine} 50%, ${T.text} 62%, ${T.text} 100%)`,
          backgroundSize: "260% 100%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          textShadow: "0 0 18px rgba(255,170,80,.12)",
        }}
        animate={{ backgroundPosition: ["100% 0%", "0% 0%"] }}
        transition={{
          duration: 1.6 / Math.max(0.5, Math.min(2, speed)),
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 0.2,
        }}
      >
        {label}
      </motion.span>
    </div>
  );
}
```
