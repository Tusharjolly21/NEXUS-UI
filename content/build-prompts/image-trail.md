Add the "Image Trail" component from Nexus UI to my project.

Move across the area and it deals out photos along your path: each lands with a small overshoot, tilted the way you were heading, carries a bit of your speed, then drops away under gravity, blurring as it fades. Turn on the magnetic effect and the pointer shoves the photos that are still lying there.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { ImageTrail, MagneticImageTrail, DEFAULT_TRAIL_IMAGES } from "@/components/image-trail";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/image-trail/image-trail.tsx ---

```tsx
"use client";
import { useEffect, useRef, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ImageTrailImage = {
  src: string;
  alt?: string;
};

export type ImageTrailSettings = {
  /** How long (ms) each image stays before it falls away. */
  duration?: number;
  /** Pointer travel (px) between one image and the next. */
  spacing?: number;
  /** 0–1. Higher lets each image glide in from the last one instead of appearing in place. */
  smoothness?: number;
};

export type ImageTrailAppearance = {
  /** Width and height of each image (px). */
  imageSize?: number;
  /** Corner radius of each image (px). */
  cornerRadius?: number;
  objectFit?: "cover" | "contain";
};

export type ImageTrailAnimation = {
  /** Fade-in time (seconds). */
  fadeInDuration?: number;
  /** Fade-out time (seconds). */
  fadeOutDuration?: number;
  /** Blur on entry (px). */
  fadeInBlur?: number;
  /** Blur on exit (px). */
  fadeOutBlur?: number;
};

export type ImageTrailMagneticSettings = {
  /** 0–1. How hard the pointer shoves images that are still on screen. */
  magneticStrength?: number;
  /** Distance (px) within which the pointer pushes. */
  magneticRadius?: number;
};

export type ImageTrailProps = {
  /** Images dealt out as the pointer moves. Defaults to six drawn postcards (no network). */
  images?: ImageTrailImage[];
  trailSettings?: ImageTrailSettings;
  appearance?: ImageTrailAppearance;
  animation?: ImageTrailAnimation;
  /** Let the pointer shove images that are already down. */
  magneticEffect?: boolean;
  magneticSettings?: ImageTrailMagneticSettings;
  /** Lay out a fixed fan of images and ignore the pointer. */
  staticPreview?: boolean;
  /** Most images on screen at once. */
  maxTrailImages?: number;
  /** Classes for the root (set its size here). */
  className?: string;
  /** Content drawn under the trail. Leave out for a centred hint. */
  children?: ReactNode;
  /** Hint shown when there are no children. An empty string hides it. */
  hint?: string;
  /** A ghost pointer draws loops across the area until someone moves over it. */
  autoplay?: boolean;

  /** Flat aliases of the grouped settings above. */
  spacing?: number;
  duration?: number;
  smoothness?: number;
  imageSize?: number;
  cornerRadius?: number;
  objectFit?: "cover" | "contain";
  fadeInDuration?: number;
  fadeOutDuration?: number;
  fadeInBlur?: number;
  fadeOutBlur?: number;
  magneticRadius?: number;
  magneticStrength?: number;
};

const svg = (body: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${body}</svg>`)}`;

/** Six postcards drawn as SVG, so the trail works offline and ships no image files. */
export const DEFAULT_TRAIL_IMAGES: ImageTrailImage[] = [
  {
    alt: "Dunes at sunset",
    src: svg(
      `<defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a59"/><stop offset=".6" stop-color="#ffc58a"/></linearGradient></defs><rect width="120" height="120" fill="url(#a)"/><circle cx="78" cy="58" r="16" fill="#fff3d6"/><path d="M0 80 C30 66 60 70 120 86 V120 H0Z" fill="#e0794f"/><path d="M0 96 C40 84 80 88 120 100 V120 H0Z" fill="#b8553a"/>`,
    ),
  },
  {
    alt: "Ocean swell",
    src: svg(
      `<defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset=".5" stop-color="#e6f6ff"/><stop offset=".5" stop-color="#2f8fd8"/><stop offset="1" stop-color="#0b4f9c"/></linearGradient></defs><rect width="120" height="120" fill="url(#a)"/><path d="M0 72 Q15 66 30 72 T60 72 T90 72 T120 72" fill="none" stroke="#bfe6ff" stroke-width="3"/><path d="M0 88 Q15 82 30 88 T60 88 T90 88 T120 88" fill="none" stroke="#7cc2f5" stroke-width="3"/><path d="M0 104 Q15 98 30 104 T60 104 T90 104 T120 104" fill="none" stroke="#5aa7e8" stroke-width="3"/>`,
    ),
  },
  {
    alt: "Pine forest",
    src: svg(
      `<rect width="120" height="120" fill="#d9f2e2"/><circle cx="30" cy="30" r="12" fill="#fff8d9"/><path d="M0 80 C40 62 80 66 120 76 V120 H0Z" fill="#7cc79a"/><path d="M20 98 32 62 44 98Z M44 102 58 56 72 102Z M70 100 82 66 94 100Z M88 104 100 72 112 104Z" fill="#1f7a4c"/><rect y="100" width="120" height="20" fill="#2e8a57"/>`,
    ),
  },
  {
    alt: "City at night",
    src: svg(
      `<defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1233"/><stop offset="1" stop-color="#3b2a6b"/></linearGradient></defs><rect width="120" height="120" fill="url(#a)"/><circle cx="92" cy="26" r="8" fill="#f2f2ff"/><path d="M6 120V70h18v50Zm22 0V52h20v68Zm24 0V78h16v42Zm20 0V44h22v76Zm26 0V66h18v54Z" fill="#141a3f"/><path d="M32 60h4v4h-4Zm8 8h4v4h-4Zm-8 16h4v4h-4Zm46-28h4v4h-4Zm8 12h4v4h-4Zm-8 16h4v4h-4Zm24 0h4v4h-4ZM10 80h4v4h-4Z" fill="#ffd27a"/>`,
    ),
  },
  {
    alt: "Aurora",
    src: svg(
      `<rect width="120" height="120" fill="#06202a"/><path d="M-10 70 C20 30 50 60 70 30 S110 20 130 10 V40 C100 50 80 80 60 60 S10 70 -10 90Z" fill="#30d158" opacity=".55"/><path d="M-10 50 C30 20 60 40 90 14 S120 0 130 0 V20 C100 30 80 50 50 46 S0 60 -10 66Z" fill="#bf5af2" opacity=".45"/><path d="M0 104 30 92 52 100 80 88 120 100 V120 H0Z" fill="#021015"/>`,
    ),
  },
  {
    alt: "Lavender rows",
    src: svg(
      `<defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9e8"/><stop offset=".5" stop-color="#f6efff"/></linearGradient></defs><rect width="120" height="120" fill="url(#a)"/><path d="M0 66h120v54H0Z" fill="#9b7be0"/><path d="M60 66 0 120h10l50-54Zm0 0-30 54h10l20-54Zm0 0v54h6Zm0 0 30 54h-10Zm0 0 60 54h-10Z" fill="#6c4fc4"/><circle cx="96" cy="34" r="10" fill="#fff4cf"/>`,
    ),
  },
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type Slot = {
  on: boolean;
  x: number;
  y: number;
  gx: number;
  gy: number;
  vx: number;
  vy: number;
  rot: number;
  spin: number;
  age: number;
};

/** A fixed fan used by `staticPreview`: [x%, y%, rotation]. */
const FAN: [number, number, number][] = [
  [28, 58, -14],
  [40, 46, -6],
  [52, 40, 3],
  [64, 46, 10],
  [76, 56, 16],
];

/**
 * Move across the area and it deals out photos along your path, under any
 * children you pass. Each one
 * lands with a little overshoot, tilted the way you were heading, carries a
 * bit of your speed as it settles, then drops away under gravity, blurring as
 * it fades. Switch on `magneticEffect` and the pointer shoves the ones still
 * lying there.
 */
export function ImageTrail({
  images = DEFAULT_TRAIL_IMAGES,
  trailSettings,
  appearance,
  animation,
  magneticEffect = false,
  magneticSettings,
  staticPreview = false,
  maxTrailImages = 16,
  className,
  children,
  hint = "Move across the canvas.",
  autoplay = false,
  spacing,
  duration,
  smoothness,
  imageSize,
  cornerRadius,
  objectFit,
  fadeInDuration,
  fadeOutDuration,
  fadeInBlur,
  fadeOutBlur,
  magneticRadius,
  magneticStrength,
}: ImageTrailProps) {
  const reduce = useReducedMotion() === true;
  const root = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  const pics = useRef<(HTMLImageElement | null)[]>([]);
  const touched = useRef(false);
  const count = Math.max(1, Math.min(60, Math.round(maxTrailImages)));

  const cfg = {
    duration: Math.max(120, duration ?? trailSettings?.duration ?? 1000) / 1000,
    spacing: Math.max(4, spacing ?? trailSettings?.spacing ?? 48),
    smooth: clamp(smoothness ?? trailSettings?.smoothness ?? 0.7, 0, 1),
    size: Math.max(20, imageSize ?? appearance?.imageSize ?? 112),
    radius: Math.max(0, cornerRadius ?? appearance?.cornerRadius ?? 14),
    fit: objectFit ?? appearance?.objectFit ?? "cover",
    fadeIn: Math.max(0.05, fadeInDuration ?? animation?.fadeInDuration ?? 0.25),
    fadeOut: Math.max(0.05, fadeOutDuration ?? animation?.fadeOutDuration ?? 0.5),
    blurIn: Math.max(0, fadeInBlur ?? animation?.fadeInBlur ?? 0),
    blurOut: Math.max(0, fadeOutBlur ?? animation?.fadeOutBlur ?? 6),
    magnet: magneticEffect,
    pull: clamp(magneticStrength ?? magneticSettings?.magneticStrength ?? 0.3, 0, 1),
    reach: Math.max(20, magneticRadius ?? magneticSettings?.magneticRadius ?? 110),
    reduce,
    srcs: images.map((i) => i.src),
  };
  const conf = useRef(cfg);
  useEffect(() => {
    conf.current = cfg;
  });

  // All motion lives in this one loop, written straight to the DOM: no React render per frame.
  const engine = useRef<{ feed: (x: number, y: number) => void; leave: () => void } | null>(null);
  useEffect(() => {
    if (staticPreview) return;
    const slots: Slot[] = Array.from({ length: count }, () => ({ on: false, x: 0, y: 0, gx: 0, gy: 0, vx: 0, vy: 0, rot: 0, spin: 0, age: 0 }));
    let next = 0;
    let pic = 0;
    let last: { x: number; y: number; t: number } | null = null;
    let anchor: { x: number; y: number } | null = null;
    let pointer: { x: number; y: number } | null = null;
    let vx = 0;
    let vy = 0;
    let raf = 0;
    let prev = 0;
    let live = 0;

    const spawn = (x: number, y: number) => {
      const c = conf.current;
      if (!c.srcs.length) return;
      const s = slots[next];
      const el = nodes.current[next];
      const img = pics.current[next];
      if (img) img.src = c.srcs[pic % c.srcs.length];
      pic++;
      next = (next + 1) % slots.length;
      const from = c.smooth > 0 && anchor ? anchor : { x, y };
      s.on = true;
      s.age = 0;
      s.x = from.x;
      s.y = from.y;
      s.gx = x;
      s.gy = y;
      s.vx = c.reduce ? 0 : vx * 0.18;
      s.vy = c.reduce ? 0 : vy * 0.18;
      s.rot = c.reduce ? 0 : clamp(vx * 0.012, -16, 16) + ((pic * 37) % 9) - 4;
      s.spin = c.reduce ? 0 : clamp(vx * 0.02, -40, 40);
      if (el) el.style.zIndex = String(++live);
      anchor = { x, y };
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = prev ? Math.min(0.05, (now - prev) / 1000) : 0;
      prev = now;
      const c = conf.current;
      vx *= Math.exp(-dt * 6);
      vy *= Math.exp(-dt * 6);
      for (let i = 0; i < slots.length; i++) {
        const s = slots[i];
        const el = nodes.current[i];
        if (!el) continue;
        if (!s.on) {
          if (el.style.opacity !== "0") el.style.opacity = "0";
          continue;
        }
        s.age += dt;
        const total = c.duration + c.fadeOut;
        if (s.age >= total) {
          s.on = false;
          el.style.opacity = "0";
          continue;
        }
        // Glide from the previous image to where this one was dealt.
        const k = 1 - Math.pow(1 - (1 - c.smooth * 0.85), dt * 60);
        s.gx += s.vx * dt;
        s.gy += s.vy * dt;
        s.vx *= Math.exp(-dt * 4);
        s.vy *= Math.exp(-dt * 4);
        s.x += (s.gx - s.x) * clamp(k, 0, 1);
        s.y += (s.gy - s.y) * clamp(k, 0, 1);
        if (c.magnet && pointer && !c.reduce) {
          const dx = s.gx - pointer.x;
          const dy = s.gy - pointer.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < c.reach) {
            const f = (1 - d / c.reach) * c.pull * 900 * dt;
            s.gx += (dx / d) * f;
            s.gy += (dy / d) * f;
          }
        }
        const out = Math.max(0, s.age - c.duration) / c.fadeOut;
        const fall = c.reduce ? 0 : out * out * 140;
        s.rot += s.spin * dt * (out > 0 ? 1.6 : 0.3);
        // Damped overshoot on landing: 0 -> ~1.12 -> 1.
        const pop = c.reduce ? 1 : 1 - Math.exp(-s.age * 11) * Math.cos(s.age * 17);
        const inA = Math.min(1, s.age / c.fadeIn);
        const opacity = inA * (1 - out);
        const blur = c.blurIn * (1 - inA) + c.blurOut * out;
        const scale = pop * (1 - out * 0.18);
        el.style.opacity = opacity.toFixed(3);
        el.style.transform = `translate3d(${(s.x - c.size / 2).toFixed(1)}px, ${(s.y - c.size / 2 + fall).toFixed(1)}px, 0) rotate(${s.rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
      }
    };
    raf = requestAnimationFrame(tick);

    engine.current = {
      feed: (x, y) => {
        pointer = { x, y };
        const t = performance.now();
        if (last) {
          const dts = Math.max(0.008, (t - last.t) / 1000);
          vx = vx * 0.5 + ((x - last.x) / dts) * 0.5;
          vy = vy * 0.5 + ((y - last.y) / dts) * 0.5;
        }
        last = { x, y, t };
        if (!anchor || Math.hypot(x - anchor.x, y - anchor.y) >= conf.current.spacing) spawn(x, y);
      },
      leave: () => {
        pointer = null;
        last = null;
      },
    };
    return () => {
      cancelAnimationFrame(raf);
      engine.current = null;
    };
  }, [count, staticPreview]);

  useEffect(() => {
    if (!autoplay || staticPreview) return;
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      if (touched.current) {
        engine.current?.leave();
        return;
      }
      raf = requestAnimationFrame(loop);
      const el = root.current;
      if (!el) return;
      const t = (now - t0) / 1000;
      const w = el.clientWidth;
      const h = el.clientHeight;
      // A lazy figure of eight that drifts.
      engine.current?.feed(w * (0.5 + 0.36 * Math.sin(t * 1.1)), h * (0.5 + 0.26 * Math.sin(t * 2.2 + 0.4)));
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [autoplay, staticPreview]);

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (staticPreview) return;
    touched.current = true;
    const r = e.currentTarget.getBoundingClientRect();
    engine.current?.feed(e.clientX - r.left, e.clientY - r.top);
  };

  const card = "absolute left-0 top-0 overflow-hidden bg-white p-[3px] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_14px_30px_-14px_rgba(0,0,0,.45)] will-change-transform dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_14px_30px_-14px_rgba(0,0,0,.9)]";

  return (
    <div
      ref={root}
      onPointerMove={onMove}
      onPointerLeave={() => engine.current?.leave()}
      className={cn(
        "relative h-80 w-full touch-pan-y select-none overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]",
        className,
      )}
    >
      {children == null && hint ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="m-0 text-[13px] text-[#86868b] dark:text-[#a1a1a6]">{hint}</p>
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {staticPreview
          ? FAN.map(([x, y, r], i) => {
              const im = images[i % Math.max(1, images.length)];
              if (!im) return null;
              return (
                <div
                  key={i}
                  className={card}
                  style={{
                    width: cfg.size,
                    height: cfg.size,
                    borderRadius: cfg.radius,
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: `translate(-50%, -50%) rotate(${r}deg)`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- data URIs and consumer images of any origin */}
                  <img src={im.src} alt="" draggable={false} className="h-full w-full" style={{ objectFit: cfg.fit, borderRadius: Math.max(0, cfg.radius - 3) }} />
                </div>
              );
            })
          : Array.from({ length: count }, (_, i) => (
              <div
                key={i}
                ref={(el) => {
                  nodes.current[i] = el;
                }}
                className={card}
                style={{ width: cfg.size, height: cfg.size, borderRadius: cfg.radius, opacity: 0 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- data URIs and consumer images of any origin */}
                <img
                  ref={(el) => {
                    pics.current[i] = el;
                  }}
                  alt=""
                  draggable={false}
                  className="h-full w-full"
                  style={{ objectFit: cfg.fit, borderRadius: Math.max(0, cfg.radius - 3) }}
                />
              </div>
            ))}
      </div>
      {children != null ? <div className="relative z-10 h-full">{children}</div> : null}
    </div>
  );
}

/** Same component with the magnetic shove switched on. */
export function MagneticImageTrail(props: ImageTrailProps) {
  return <ImageTrail magneticEffect {...props} />;
}
```

--- components/image-trail/index.ts ---

```ts
export type {
  ImageTrailProps,
  ImageTrailImage,
  ImageTrailSettings,
  ImageTrailAppearance,
  ImageTrailAnimation,
  ImageTrailMagneticSettings,
} from "./image-trail";
export { ImageTrail, MagneticImageTrail, DEFAULT_TRAIL_IMAGES } from "./image-trail";
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
