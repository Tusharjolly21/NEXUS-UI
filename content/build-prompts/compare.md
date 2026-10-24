Add the "Before / After Compare" component from Nexus UI to my project.

A before and after comparison for images or any two pieces of content. Press or drag anywhere and the divider springs to your finger with a little follow-through, the handle stretches in the direction it travels and each label fades as the divider reaches it; arrow keys move it too.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { Compare } from "@/components/compare";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/compare/compare.tsx ---

```tsx
"use client";

import * as React from "react";
import { motion, useMotionTemplate, useReducedMotion, useSpring, useTransform, useVelocity } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CompareProps {
  /** Image src for the left (before) side. */
  beforeImage?: string;
  /** Image src for the right (after) side. */
  afterImage?: string;
  /** Alt text for `beforeImage`. */
  beforeAlt?: string;
  /** Alt text for `afterImage`. */
  afterAlt?: string;
  /** Any content for the left (before) side; overrides beforeImage. */
  beforeContent?: React.ReactNode;
  /** Any content for the right (after) side; overrides afterImage. */
  afterContent?: React.ReactNode;
  /** Label chip on the left side. */
  beforeLabel?: string;
  /** Label chip on the right side. */
  afterLabel?: string;
  /** Starting divider position as a percentage (0-100). @default 50 */
  initialPosition?: number;
  /** "drag": press or drag anywhere to move the divider. "hover": it follows the pointer and returns on leave. */
  mode?: "drag" | "hover";
  /** Called with the divider position (0-100) when the user moves it. */
  onChange?: (position: number) => void;
  /** Sweeps the divider back and forth until someone touches it. */
  autoplay?: boolean;
  className?: string;
}

const clamp = (v: number) => Math.min(100, Math.max(0, v));

/** A drawn alpine lake at dusk, so the component works without any images. */
function Scene() {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg className="absolute inset-0 size-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a3b78" />
          <stop offset=".45" stopColor="#c36b9a" />
          <stop offset=".72" stopColor="#ffb36b" />
          <stop offset="1" stopColor="#ffd9a0" />
        </linearGradient>
        <linearGradient id={`${id}-lake`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffbf80" />
          <stop offset=".35" stopColor="#b8678f" />
          <stop offset="1" stopColor="#1f2a5c" />
        </linearGradient>
        <radialGradient id={`${id}-sun`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff5d6" />
          <stop offset=".5" stopColor="#ffe2a3" stopOpacity=".9" />
          <stop offset="1" stopColor="#ffd28a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="190" fill={`url(#${id}-sky)`} />
      <circle cx="262" cy="150" r="70" fill={`url(#${id}-sun)`} />
      <circle cx="262" cy="152" r="17" fill="#fff4d2" />
      <path d="M0 150 L52 98 L86 128 L132 72 L178 132 L214 108 L262 150 L300 112 L344 140 L380 104 L400 120 V190 H0Z" fill="#5d3f7a" />
      <path d="M132 72 L146 90 L138 92 L128 86 L120 90Z" fill="#f3d7e6" opacity=".9" />
      <path d="M380 104 L390 116 L382 114 L374 118Z" fill="#f3d7e6" opacity=".8" />
      <path d="M0 170 L40 140 L76 160 L118 128 L162 166 L206 146 L244 170 L290 150 L338 168 L400 146 V190 H0Z" fill="#3c2b5e" />
      <rect y="190" width="400" height="110" fill={`url(#${id}-lake)`} />
      <path d="M0 190 L40 210 L76 200 L118 222 L162 198 L206 212 L244 196 L290 208 L338 198 L400 212 V190Z" fill="#3c2b5e" opacity=".55" />
      <rect x="236" y="196" width="52" height="3" rx="1.5" fill="#fff4d2" opacity=".75" />
      <rect x="246" y="206" width="32" height="2.5" rx="1.25" fill="#fff4d2" opacity=".5" />
      <rect x="254" y="216" width="18" height="2" rx="1" fill="#fff4d2" opacity=".35" />
      <g fill="#1b1533">
        <path d="M18 196 L30 150 L42 196Z" />
        <path d="M36 198 L52 136 L68 198Z" />
        <path d="M60 196 L72 160 L84 196Z" />
        <path d="M330 196 L344 146 L358 196Z" />
        <path d="M352 198 L370 132 L388 198Z" />
        <rect y="194" width="400" height="6" />
      </g>
    </svg>
  );
}

function Chevrons() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M7.5 5.5 3.5 10l4 4.5M12.5 5.5l4 4.5-4 4.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * A before / after comparison. Press or drag anywhere and the divider
 * springs to your finger with a little follow-through; the handle stretches
 * in the direction it's travelling and the labels fade as the divider
 * reaches them. Works with images, any content, or the drawn default scene.
 */
export function Compare({
  beforeImage,
  afterImage,
  beforeAlt = "Before",
  afterAlt = "After",
  beforeContent,
  afterContent,
  beforeLabel,
  afterLabel,
  initialPosition = 50,
  mode = "drag",
  onChange,
  autoplay = false,
  className,
}: CompareProps) {
  const still = useReducedMotion() === true;
  const start = clamp(initialPosition);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const touched = React.useRef(false);
  const dragging = React.useRef(false);
  const [grabbed, setGrabbed] = React.useState(false);
  const [now, setNow] = React.useState(Math.round(start));

  const pos = useSpring(start, still ? { stiffness: 2000, damping: 120 } : { stiffness: 320, damping: 26, mass: 0.7 });
  const left = useMotionTemplate`${pos}%`;
  const clip = useTransform(pos, (p) => `inset(0 ${100 - clamp(p)}% 0 0)`);
  const velocity = useVelocity(pos);
  const stretch = useSpring(
    useTransform(velocity, (v) => (still ? 0 : Math.min(0.45, Math.abs(v) / 900))),
    { stiffness: 500, damping: 20 },
  );
  const handleSX = useTransform(stretch, (s) => 1 + s);
  const handleSY = useTransform(stretch, (s) => 1 - s * 0.35);
  const beforeChip = useTransform(pos, [6, 26], [0, 1]);
  const afterChip = useTransform(pos, [74, 94], [1, 0]);

  const setTo = (p: number, notify = true) => {
    const v = clamp(p);
    pos.set(v);
    const r = Math.round(v);
    setNow(r);
    if (notify) onChange?.(r);
  };

  const toPercent = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return start;
    const { left: l, width } = el.getBoundingClientRect();
    return ((clientX - l) / width) * 100;
  };

  const touch = () => {
    touched.current = true;
  };

  React.useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const stops = [28, 74, 40, 62];
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      const v = stops[k++ % stops.length];
      pos.set(v);
      setNow(v);
    }, 1800);
    return () => clearInterval(t);
  }, [autoplay, pos]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    touch();
    if (mode !== "drag" || e.button > 0) return;
    dragging.current = true;
    setGrabbed(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    setTo(toPercent(e.clientX));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const stepBy = e.shiftKey ? 10 : 5;
    let to: number | null = null;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") to = now - stepBy;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") to = now + stepBy;
    if (e.key === "Home") to = 0;
    if (e.key === "End") to = 100;
    if (to === null) return;
    e.preventDefault();
    touch();
    setTo(to);
  };

  const useContent = !!(beforeContent || afterContent);
  const after = useContent ? (
    <div className="absolute inset-0">{afterContent}</div>
  ) : afterImage ? (
    // eslint-disable-next-line @next/next/no-img-element -- any URL the caller passes, no loader config needed
    <img src={afterImage} alt={afterAlt} className="absolute inset-0 block size-full object-cover" draggable={false} />
  ) : (
    <Scene />
  );
  const before = useContent ? (
    beforeContent
  ) : beforeImage ? (
    // eslint-disable-next-line @next/next/no-img-element -- any URL the caller passes, no loader config needed
    <img src={beforeImage} alt={beforeAlt} className="absolute inset-0 block size-full object-cover" draggable={false} />
  ) : (
    <div className="absolute inset-0 [filter:grayscale(1)_contrast(.88)_brightness(1.06)]">
      <Scene />
    </div>
  );

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={(e) => {
        if (mode === "hover" || dragging.current) {
          if (mode === "hover") touch();
          setTo(toPercent(e.clientX));
        }
      }}
      onPointerUp={() => {
        dragging.current = false;
        setGrabbed(false);
      }}
      onPointerCancel={() => {
        dragging.current = false;
        setGrabbed(false);
      }}
      onPointerLeave={() => {
        if (mode === "hover") setTo(start);
      }}
      className={cn(
        "relative isolate aspect-[4/3] w-full max-w-[480px] touch-pan-y select-none overflow-hidden rounded-[22px] bg-[#1c1c1e]",
        "shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]",
        mode === "drag" ? (grabbed ? "cursor-grabbing" : "cursor-ew-resize") : "cursor-ew-resize",
        className,
      )}
    >
      {after}
      <motion.div className="pointer-events-none absolute inset-0" style={{ clipPath: clip }}>
        {before}
      </motion.div>

      <motion.div className="pointer-events-none absolute inset-y-0 w-[2px] bg-white/95 shadow-[0_0_0_0.5px_rgba(0,0,0,.15),0_0_12px_rgba(0,0,0,.25)]" style={{ left, x: "-50%" }} />

      <motion.div
        role="slider"
        tabIndex={0}
        aria-label="Comparison divider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={now}
        aria-valuetext={`${now}% ${beforeLabel ?? "before"}`}
        onKeyDown={onKeyDown}
        className="absolute top-1/2 z-10 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0071e3]"
        style={{ left, x: "-50%", y: "-50%" }}
      >
        <motion.span
          className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#1d1d1f] shadow-[0_0_0_0.5px_rgba(0,0,0,.12),0_8px_20px_-6px_rgba(0,0,0,.45)] backdrop-blur-md"
          style={{ scaleX: handleSX, scaleY: handleSY }}
          animate={{ scale: grabbed ? 1.12 : 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
        >
          <Chevrons />
        </motion.span>
      </motion.div>

      {beforeLabel ? (
        <motion.span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[12px] font-semibold text-white backdrop-blur-md" style={{ opacity: beforeChip }}>
          {beforeLabel}
        </motion.span>
      ) : null}
      {afterLabel ? (
        <motion.span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[12px] font-semibold text-white backdrop-blur-md" style={{ opacity: afterChip }}>
          {afterLabel}
        </motion.span>
      ) : null}
    </div>
  );
}
```

--- components/compare/index.ts ---

```ts
export { Compare } from "./compare";
export type { CompareProps } from "./compare";
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
