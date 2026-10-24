# Particle Mark

Add the "Particle Mark" component from Nexus UI to my project.

A word drawn as a few hundred dots that scatter away from the pointer and spring home, warming to the accent colour the further they are pushed. Click anywhere for a shockwave.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { ParticleMark } from "@/components/particle-mark";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/particle-mark/index.ts ---

```ts
export { ParticleMark } from "./particle-mark";
export type { ParticleMarkProps } from "./particle-mark";
```

--- components/particle-mark/particle-mark.tsx ---

```tsx
"use client";
import { useEffect, useRef, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";

export interface ParticleMarkProps {
  /** The word drawn in dots. Long words are shrunk to fit. */
  text?: string;
  /** Colour the dots warm to as they are pushed away from home (hex). */
  accent?: string;
  /** Line under the canvas. Pass an empty string to hide it. */
  hint?: string;
  /** An invisible pointer loops through the word, with a shockwave every few seconds, until someone points at it. */
  autoplay?: boolean;
}

const W = 440, H = 240;

function parseHex(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) return [0, 113, 227];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * A word drawn as a few hundred dots. They scatter away from the pointer and
 * spring home behind it, warming to the accent colour the further they are
 * pushed. Press anywhere and a shockwave throws them out before they gather
 * again.
 */
export function ParticleMark({ text = "motion", accent = "#0071e3", hint = "Brush through the dots. Click for a shockwave.", autoplay = false }: ParticleMarkProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const ptr = useRef<{ x: number; y: number } | null>(null);
  const waves = useRef<{ x: number; y: number; r: number }[]>([]);
  const touched = useRef(false);
  const dark = useRef(false);

  // Track the site theme so resting dots are drawn in the right ink.
  useEffect(() => {
    const root = document.documentElement;
    const update = () => { dark.current = root.classList.contains("dark"); };
    update();
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = W * dpr; c.height = H * dpr;
    ctx.scale(dpr, dpr);

    // Sample the word into home positions.
    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const o = off.getContext("2d", { willReadFrequently: true });
    if (!o) return;
    o.fillStyle = "#000";
    o.textAlign = "center";
    o.textBaseline = "middle";
    const font = (px: number) => `700 ${px}px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif`;
    let size = 150;
    o.font = font(size);
    while (o.measureText(text).width > W - 40 && size > 40) { size -= 6; o.font = font(size); }
    o.fillText(text, W / 2, H / 2 + 6);
    const data = o.getImageData(0, 0, W, H).data;
    const pts: { hx: number; hy: number; x: number; y: number; vx: number; vy: number }[] = [];
    const step = 5;
    for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
      if (data[(y * W + x) * 4 + 3] > 128) pts.push({ hx: x, hy: y, x: x + (Math.random() - 0.5) * 300, y: y + (Math.random() - 0.5) * 300, vx: 0, vy: 0 });
    }

    const [ar, ag, ab] = parseHex(accent);
    let raf = 0, t = 0, lastWave = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      t += 0.016;
      let p = ptr.current;
      if (autoplay && !touched.current) {
        p = { x: W / 2 + Math.cos(t * 0.7) * 190, y: H / 2 + Math.sin(t * 1.4) * 105 };
        if (t - lastWave > 4.5) { lastWave = t; waves.current.push({ x: W / 2, y: H / 2, r: 0 }); }
      }
      for (const w of waves.current) w.r += 9;
      waves.current = waves.current.filter((w) => w.r < 520);
      // Resting ink: #1d1d1f in light, #f5f5f7 in dark.
      const [ir, ig, ib] = dark.current ? [245, 245, 247] : [29, 29, 31];
      ctx.clearRect(0, 0, W, H);
      for (const q of pts) {
        // Spring toward home.
        q.vx += (q.hx - q.x) * 0.045; q.vy += (q.hy - q.y) * 0.045;
        // Pushed away from the pointer inside 70px, harder the closer it is.
        if (p) {
          const dx = q.x - p.x, dy = q.y - p.y, d2 = dx * dx + dy * dy;
          if (d2 < 70 * 70) { const d = Math.sqrt(d2) || 1, f = (70 - d) / 70; q.vx += (dx / d) * f * 6; q.vy += (dy / d) * f * 6; }
        }
        // A shockwave ring kicks every dot within 14px of its edge outward.
        for (const w of waves.current) {
          const dx = q.x - w.x, dy = q.y - w.y, d = Math.hypot(dx, dy) || 1;
          if (Math.abs(d - w.r) < 14) { q.vx += (dx / d) * 9; q.vy += (dy / d) * 9; }
        }
        q.vx *= 0.82; q.vy *= 0.82;
        q.x += q.vx; q.y += q.vy;
        const away = Math.min(1, Math.hypot(q.x - q.hx, q.y - q.hy) / 40);
        ctx.fillStyle = `rgb(${Math.round(ir + (ar - ir) * away)},${Math.round(ig + (ag - ig) * away)},${Math.round(ib + (ab - ib) * away)})`;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 1.9 + away * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [text, accent, autoplay]);

  const local = (e: RPointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const onKey = (e: RKeyboardEvent<HTMLCanvasElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    touched.current = true;
    waves.current.push({ x: W / 2, y: H / 2, r: 0 });
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvas}
        className="cursor-pointer touch-none rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] dark:focus-visible:ring-[#0a84ff]"
        style={{ width: W, maxWidth: "100%", aspectRatio: `${W} / ${H}` }}
        onPointerMove={(e) => { touched.current = true; ptr.current = local(e); }}
        onPointerDown={(e) => { touched.current = true; waves.current.push({ ...local(e), r: 0 }); }}
        onPointerLeave={() => { ptr.current = null; }}
        onKeyDown={onKey}
        tabIndex={0}
        role="button"
        aria-label={`The word ${text} made of dots. Press to send a shockwave through it.`}
      />
      {hint ? <span className="text-[13px] text-[#86868b] dark:text-[#8e8e93]">{hint}</span> : null}
    </div>
  );
}
```
