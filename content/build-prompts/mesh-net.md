# Mesh Net

Add the "Mesh Net" component from Nexus UI to my project.

A distorted triangle net that hides in the dark until the cursor comes near. Nodes are shoved outward on springs, overshoot a little as they settle, and the edges light up like a torch passing over them, then fade out again with distance.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { MeshNet } from "@/components/mesh-net";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/mesh-net/index.ts ---

```ts
export { MeshNet } from "./mesh-net";
export type { MeshNetProps } from "./mesh-net";
```

--- components/mesh-net/mesh-net.tsx ---

```tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Mesh Net: a distorted triangular net that sits almost invisible until the cursor comes close.
 * Near the pointer the nodes are pushed outward on springs, the edges light up and fade back out
 * with distance, so the structure seems to be uncovered by a torch. Nodes overshoot a little as
 * they settle. With `autoplay` an invisible pointer drifts in a slow loop until you take over.
 * Fills its nearest positioned parent; put content on top with `children`. Pauses off screen and
 * stays still for people who prefer reduced motion.
 */
export type MeshNetProps = {
  /** Colour of the lit edges, as a 6-digit hex. */
  color?: string;
  background?: string;
  /** Spacing between nodes, in px. */
  gridSize?: number;
  /** Random offset of each node, as a fraction of the spacing (0 to 0.5). */
  distortion?: number;
  /** Radius around the pointer where the net shows and reacts, in px. */
  revealRadius?: number;
  /** How far nodes are shoved away from the pointer, in px. */
  push?: number;
  /** A ghost pointer drifts in a slow loop until a real pointer arrives. */
  autoplay?: boolean;
  className?: string;
  children?: ReactNode;
};

export function MeshNet({
  color = "#5b4fe0",
  background = "#000000",
  gridSize = 64,
  distortion = 0.5,
  revealRadius = 230,
  push = 30,
  autoplay = false,
  className,
  children,
}: MeshNetProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const g = canvas.getContext("2d")!;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1;
    let cols = 0, rows = 0;
    let bx: Float32Array, by: Float32Array, px: Float32Array, py: Float32Array, vx: Float32Array, vy: Float32Array;
    const pointer = { x: -9999, y: -9999, sx: -9999, sy: -9999, live: false, strength: 0 };
    let touched = false;

    const n = parseInt(color.slice(1), 16);
    const rgb = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;

    const build = () => {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = wrap.offsetWidth || r.width;
      h = wrap.offsetHeight || r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const s = gridSize;
      const rowH = s * 0.866;
      cols = Math.ceil(w / s) + 3;
      rows = Math.ceil(h / rowH) + 3;
      const count = cols * rows;
      bx = new Float32Array(count); by = new Float32Array(count);
      px = new Float32Array(count); py = new Float32Array(count);
      vx = new Float32Array(count); vy = new Float32Array(count);
      let seed = 11;
      const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          bx[k] = (i - 1) * s + (j % 2 ? s / 2 : 0) + rand() * s * distortion;
          by[k] = (j - 1) * rowH + rand() * s * distortion;
          px[k] = bx[k];
          py[k] = by[k];
        }
      }
    };
    const ro = new ResizeObserver(build);
    ro.observe(wrap);
    build();

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      // Undo any CSS scale on a parent so pointer space matches layout space.
      const k = wrap.offsetWidth ? r.width / wrap.offsetWidth : 1;
      const x = (e.clientX - r.left) / k, y = (e.clientY - r.top) / k;
      if (x < -40 || y < -40 || x > w + 40 || y > h + 40) {
        pointer.live = false;
        return;
      }
      touched = true;
      pointer.live = true;
      pointer.x = x;
      pointer.y = y;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let visible = true;
    let prev = performance.now();
    const R = revealRadius;
    const frame = (now: number) => {
      raf = visible ? requestAnimationFrame(frame) : 0;
      if (!visible) return;
      const dt = Math.max(0, Math.min(0.033, (now - prev) / 1000));
      prev = now;
      // ghost pointer for the self-demo
      if (autoplay && !touched && !reduced) {
        const t = now / 1000;
        pointer.x = w * (0.5 + 0.32 * Math.sin(t * 0.7));
        pointer.y = h * (0.5 + 0.26 * Math.sin(t * 1.1 + 1));
        pointer.live = true;
      }
      // the light trails the pointer instead of sticking to it
      const follow = 1 - Math.pow(0.0005, dt);
      pointer.sx += (pointer.x - pointer.sx) * (pointer.sx < -9000 ? 1 : follow);
      pointer.sy += (pointer.y - pointer.sy) * (pointer.sy < -9000 ? 1 : follow);
      pointer.strength += ((pointer.live ? 1 : 0) - pointer.strength) * Math.min(1, dt * 4);

      const count = cols * rows;
      for (let k = 0; k < count; k++) {
        let fx = (bx[k] - px[k]) * 90;
        let fy = (by[k] - py[k]) * 90;
        const dx = bx[k] - pointer.sx, dy = by[k] - pointer.sy;
        const d = Math.hypot(dx, dy);
        if (d < R && d > 0.001 && !reduced) {
          const k2 = (1 - d / R) * (1 - d / R) * pointer.strength;
          fx += (dx / d) * push * k2 * 90;
          fy += (dy / d) * push * k2 * 90;
        }
        vx[k] = (vx[k] + fx * dt) * Math.pow(0.02, dt);
        vy[k] = (vy[k] + fy * dt) * Math.pow(0.02, dt);
        px[k] += vx[k] * dt;
        py[k] += vy[k] * dt;
      }

      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = background;
      g.fillRect(0, 0, w, h);
      // faint resting net everywhere, bright inside the reveal radius
      const edge = (a: number, b: number) => {
        const mx = (px[a] + px[b]) / 2 - pointer.sx, my = (py[a] + py[b]) / 2 - pointer.sy;
        const d = Math.hypot(mx, my);
        const lit = d < R * 1.2 ? Math.pow(1 - d / (R * 1.2), 1.6) * pointer.strength : 0;
        // outside the light the net is gone entirely
        const alpha = lit * 0.95;
        if (alpha < 0.015) return;
        g.strokeStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
        g.lineWidth = 0.7 + lit * 0.5;
        g.beginPath();
        g.moveTo(px[a], py[a]);
        g.lineTo(px[b], py[b]);
        g.stroke();
      };
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          if (i + 1 < cols) edge(k, k + 1);
          if (j + 1 < rows) {
            const down = (j + 1) * cols + i;
            edge(k, down);
            const diag = j % 2 ? down + 1 : down - 1;
            if (diag >= (j + 1) * cols && diag < (j + 2) * cols) edge(k, diag);
          }
        }
      }
    };
    raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        prev = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(wrap);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [color, background, gridSize, distortion, revealRadius, push, autoplay]);

  return (
    <div ref={wrapRef} className={cn("relative h-full w-full overflow-hidden", className)}>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
      {children ? <div className="relative z-10 h-full">{children}</div> : null}
    </div>
  );
}
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
