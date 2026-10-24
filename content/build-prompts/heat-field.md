# Heat Field

Add the "Heat Field" component from Nexus UI to my project.

A field of grey dots that melts into a heat map under the cursor, swelling and blending from yellow through red to violet. Press and hold to leave heat behind that slowly cools.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { HeatField } from "@/components/heat-field";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/heat-field/heat-field.tsx ---

```tsx
"use client";
import { useEffect, useId, useRef, type PointerEvent as RPointerEvent } from "react";

export interface HeatFieldProps {
  /** Spread (px) of the heat around the pointer. Held heat spreads a little wider. */
  radius?: number;
  /** Line under the field. Pass an empty string to hide it. */
  hint?: string;
  /** An invisible hand wanders across the field, now and then pressing, until someone points at it. */
  autoplay?: boolean;
}

const W = 440, H = 280, GAP = 20;
/** Heat ramp, coolest to hottest: yellow, orange, red, violet. */
const STOPS: [number, number, number][] = [[255, 214, 10], [255, 159, 10], [255, 69, 58], [191, 90, 242]];

function heatColor(h: number) {
  const t = Math.min(0.999, h) * (STOPS.length - 1);
  const i = Math.floor(t), f = t - i;
  const a = STOPS[i], b = STOPS[i + 1];
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`;
}

/**
 * A field of grey dots that turns into a heat map under the cursor. Dots near
 * the hand swell and melt into each other (an SVG goo filter over the hot
 * layer), shading from yellow to violet. Press and hold to leave a hot spot
 * that slowly cools.
 */
export function HeatField({ radius = 46, hint = "Move across the dots. Press and hold to leave heat behind.", autoplay = false }: HeatFieldProps) {
  const base = useRef<HTMLCanvasElement>(null);
  const hot = useRef<HTMLCanvasElement>(null);
  const ptr = useRef<{ x: number; y: number; down: boolean } | null>(null);
  const touched = useRef(false);
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    const b = base.current, h = hot.current;
    const bx = b?.getContext("2d"), hx = h?.getContext("2d");
    if (!b || !h || !bx || !hx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    for (const c of [b, h]) { c.width = W * dpr; c.height = H * dpr; }
    bx.scale(dpr, dpr); hx.scale(dpr, dpr);
    const dots: { x: number; y: number; h: number; stamp: number }[] = [];
    for (let y = GAP; y < H; y += GAP) for (let x = GAP; x < W; x += GAP) dots.push({ x, y, h: 0, stamp: 0 });

    // The resting grey dots live on their own canvas; redraw them when the site theme flips.
    const root = document.documentElement;
    const drawBase = () => {
      bx.clearRect(0, 0, W, H);
      bx.fillStyle = root.classList.contains("dark") ? "#3a3a3c" : "#d2d2d7";
      for (const d of dots) { bx.beginPath(); bx.arc(d.x, d.y, 2.6, 0, Math.PI * 2); bx.fill(); }
    };
    drawBase();
    const mo = new MutationObserver(drawBase);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });

    const sigma = 2 * radius * radius;
    const held = 2 * (radius + 14) * (radius + 14);
    let raf = 0, t = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      t += 0.016;
      let p = ptr.current;
      if (autoplay && !touched.current) p = { x: W / 2 + Math.sin(t * 0.9) * 150, y: H / 2 + Math.sin(t * 1.7) * 80, down: Math.sin(t * 0.5) > 0.96 };
      hx.clearRect(0, 0, W, H);
      for (const d of dots) {
        let target = 0;
        if (p) {
          const dist2 = (d.x - p.x) ** 2 + (d.y - p.y) ** 2;
          target = Math.exp(-dist2 / sigma);
          if (p.down) d.stamp = Math.max(d.stamp, Math.exp(-dist2 / held));
        }
        d.stamp *= 0.996;
        target = Math.max(target, d.stamp);
        // Heat up fast, cool down slowly.
        d.h += (target - d.h) * (target > d.h ? 0.25 : 0.05);
        if (d.h < 0.04) continue;
        hx.fillStyle = heatColor(d.h);
        hx.beginPath();
        hx.arc(d.x, d.y, 2.6 + d.h * 10, 0, Math.PI * 2);
        hx.fill();
      }
    };
    loop();
    return () => { cancelAnimationFrame(raf); mo.disconnect(); };
  }, [autoplay, radius]);

  const local = (e: RPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id={`heat-${id}`}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
          <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
        </filter>
      </svg>
      <div
        className="relative cursor-crosshair touch-none overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
        style={{ width: W, maxWidth: "100%", aspectRatio: `${W} / ${H}` }}
        onPointerMove={(e) => { touched.current = true; ptr.current = { ...local(e), down: ptr.current?.down ?? false }; }}
        onPointerDown={(e) => { touched.current = true; ptr.current = { ...local(e), down: true }; }}
        onPointerUp={() => { if (ptr.current) ptr.current.down = false; }}
        onPointerLeave={() => { ptr.current = null; }}
        role="img"
        aria-label="Dot field that turns into a heat map under the pointer"
      >
        <canvas ref={base} className="absolute inset-0 h-full w-full" />
        <canvas ref={hot} className="absolute inset-0 h-full w-full" style={{ filter: `url(#heat-${id})` }} />
      </div>
      {hint ? <span className="text-[13px] text-[#86868b] dark:text-[#8e8e93]">{hint}</span> : null}
    </div>
  );
}
```

--- components/heat-field/index.ts ---

```ts
export { HeatField } from "./heat-field";
export type { HeatFieldProps } from "./heat-field";
```
