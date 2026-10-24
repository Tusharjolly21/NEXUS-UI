# Particle Reveal

Add the "Particle Reveal" component from Nexus UI to my project.

A headline made of thousands of dots that gather out of a scatter on springs, each with its own slight delay, like dust settling. The cursor pushes nearby dots aside and combs them into streaks, they flow back when it leaves, and a click blows the word apart again.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { ParticleReveal } from "@/components/particle-reveal";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/particle-reveal/index.ts ---

```ts
export { ParticleReveal } from "./particle-reveal";
export type { ParticleRevealProps } from "./particle-reveal";
```

--- components/particle-reveal/particle-reveal.tsx ---

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Particle Reveal: a headline built from thousands of dots. They start scattered across the stage
 * and gather into the letters on springs, each with its own slight delay, so the word condenses
 * like dust settling. The cursor pushes nearby dots away and they flow back when it leaves. Click
 * the stage to blow the word apart and let it re-form. The real text stays in the page for screen
 * readers and search engines. Pauses off screen and shows the finished word under reduced motion.
 */
export type ParticleRevealProps = {
  /** The word to draw. Short words read best. */
  text?: string;
  /** Colour of the dots. */
  color?: string;
  /** Radius of each dot in px. */
  particleSize?: number;
  /** Sampling step in px: lower is denser (2 to 8). */
  density?: number;
  /** How far the dots start from the letters, as a fraction of the stage (0 to 1.5). */
  dispersion?: number;
  /** Radius around the cursor that pushes dots away, in px. */
  hoverRadius?: number;
  /** Strength of the push. */
  hoverForce?: number;
  /** A ghost cursor combs through the word and the word bursts and re-forms every few seconds, until a real pointer arrives. */
  autoplay?: boolean;
  className?: string;
};

export function ParticleReveal({
  text = "Reveal",
  color = "#3a3a3c",
  particleSize = 1,
  density = 3.2,
  dispersion = 1,
  hoverRadius = 70,
  hoverForce = 1,
  autoplay = false,
  className,
}: ParticleRevealProps) {
  const wrapRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const burstRef = useRef<() => void>(() => {});
  const [hint, setHint] = useState(true);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const g = canvas.getContext("2d")!;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1;
    let tx = new Float32Array(0), ty = new Float32Array(0);
    let x = new Float32Array(0), y = new Float32Array(0), vx = new Float32Array(0), vy = new Float32Array(0), wake = new Float32Array(0);
    const pointer = { x: -9999, y: -9999, live: false, vx: 0, vy: 0, lx: -9999, ly: -9999 };
    let touched = false;
    let clock = 0;

    const scatter = (fromCenter: boolean) => {
      for (let i = 0; i < tx.length; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = (0.25 + Math.random() * 0.75) * Math.max(w, h) * 0.6 * dispersion;
        if (fromCenter) {
          vx[i] += Math.cos(a) * r * 4;
          vy[i] += Math.sin(a) * r * 4;
        } else {
          x[i] = w / 2 + Math.cos(a) * r;
          y[i] = h / 2 + Math.sin(a) * r;
          vx[i] = vy[i] = 0;
        }
        wake[i] = clock + Math.random() * 0.9; // each dot starts gathering a moment apart
      }
    };
    burstRef.current = () => scatter(true);

    const build = () => {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = wrap.offsetWidth || r.width;
      h = wrap.offsetHeight || r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      // sample the word from an offscreen canvas
      if (w < 1 || h < 1) return;
      const off = document.createElement("canvas");
      off.width = Math.round(w);
      off.height = Math.round(h);
      const o = off.getContext("2d")!;
      let size = Math.min(h * 0.5, (w * 0.9) / Math.max(1, text.length * 0.55));
      o.font = `500 ${size}px "Helvetica Neue", -apple-system, BlinkMacSystemFont, Inter, sans-serif`;
      const mw = o.measureText(text).width;
      if (mw > w * 0.88) size *= (w * 0.88) / mw;
      o.font = `500 ${size}px "Helvetica Neue", -apple-system, BlinkMacSystemFont, Inter, sans-serif`;
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.fillStyle = "#000";
      o.fillText(text, w / 2, h / 2);
      const data = o.getImageData(0, 0, off.width, off.height).data;
      const step = Math.max(2, Math.min(8, density));
      const ptsX: number[] = [], ptsY: number[] = [];
      for (let yy = 0; yy < off.height; yy += step) {
        for (let xx = 0; xx < off.width; xx += step) {
          // the step can be fractional, so read the nearest whole pixel
          const ix = Math.round(xx), iy = Math.round(yy);
          if (ix < off.width && iy < off.height && data[(iy * off.width + ix) * 4 + 3] > 128) {
            ptsX.push(xx);
            ptsY.push(yy);
          }
        }
      }
      const n = ptsX.length;
      tx = Float32Array.from(ptsX);
      ty = Float32Array.from(ptsY);
      x = new Float32Array(n); y = new Float32Array(n); vx = new Float32Array(n); vy = new Float32Array(n); wake = new Float32Array(n);
      if (reduced) {
        x.set(tx);
        y.set(ty);
      } else scatter(false);
    };
    const ro = new ResizeObserver(build);
    ro.observe(wrap);
    build();

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      // Undo any CSS scale on a parent so pointer space matches layout space.
      const k = wrap.offsetWidth ? r.width / wrap.offsetWidth : 1;
      pointer.x = (e.clientX - r.left) / k;
      pointer.y = (e.clientY - r.top) / k;
      pointer.live = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= w && pointer.y <= h;
      if (pointer.live) touched = true;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let visible = true;
    let prev = performance.now();
    let nextBurst = 4.5;
    const frame = (now: number) => {
      raf = visible ? requestAnimationFrame(frame) : 0;
      if (!visible) return;
      const dt = Math.max(0, Math.min(0.033, (now - prev) / 1000));
      prev = now;
      clock += dt;
      let px = pointer.x, py = pointer.y, live = pointer.live;
      if (autoplay && !touched && !reduced) {
        // a ghost cursor combs through the word, and every few seconds the word bursts and re-forms
        live = clock > 2.2;
        px = w * (0.5 + 0.42 * Math.sin(clock * 0.9));
        py = h * (0.5 + 0.12 * Math.sin(clock * 2.3));
        if (clock > nextBurst) {
          scatter(true);
          nextBurst = clock + 6;
        }
      }
      // pointer velocity (px/s), smoothed, for the sweep
      if (pointer.lx > -9000 && dt > 0) {
        pointer.vx += ((px - pointer.lx) / dt - pointer.vx) * 0.3;
        pointer.vy += ((py - pointer.ly) / dt - pointer.vy) * 0.3;
      }
      pointer.lx = px;
      pointer.ly = py;
      const R = hoverRadius, R2 = R * R;
      const k = 60, keep = Math.pow(0.004, dt);
      for (let i = 0; i < tx.length; i++) {
        let fx = 0, fy = 0;
        if (clock >= wake[i]) {
          fx = (tx[i] - x[i]) * k;
          fy = (ty[i] - y[i]) * k;
        }
        if (live) {
          const dx = x[i] - px, dy = y[i] - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const fall = 1 - d / R;
            const f = fall * 5200 * hoverForce;
            // push outward, and sweep the dots along with the cursor so they comb into streaks
            fx += (dx / d) * f + pointer.vx * fall * 9 * hoverForce;
            fy += (dy / d) * f + pointer.vy * fall * 9 * hoverForce;
          }
        }
        vx[i] = (vx[i] + fx * dt) * keep;
        vy[i] = (vy[i] + fy * dt) * keep;
        x[i] += vx[i] * dt;
        y[i] += vy[i] * dt;
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      g.fillStyle = color;
      const s = particleSize * 2;
      for (let i = 0; i < tx.length; i++) g.fillRect(x[i] - particleSize, y[i] - particleSize, s, s);
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
  }, [text, color, particleSize, density, dispersion, hoverRadius, hoverForce, autoplay]);

  return (
    <div className={cn("flex w-full flex-col items-center gap-3", className)} style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}>
      <motion.button
        type="button"
        ref={wrapRef}
        whileTap={{ scale: 0.99 }}
        onClick={() => {
          burstRef.current();
          setHint(false);
        }}
        aria-label={`${text}. Activate to scatter the letters and watch them gather again.`}
        className="relative h-[300px] w-full cursor-crosshair overflow-hidden rounded-[24px] border-0 bg-white p-0 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] outline-none focus-visible:ring-4 focus-visible:ring-[#0071e3]/50"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <span className="sr-only">{text}</span>
      </motion.button>
      <p className="m-0 text-[12px] text-[#6e6e73]">{hint ? "Sweep the cursor through the word. Click to blow it apart." : "Watch it gather again."}</p>
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
