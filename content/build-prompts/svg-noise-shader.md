Add the "SVG Noise Shader" component from Nexus UI to my project.

A grainy gradient surface built from SVG feTurbulence: film grain that flickers over soft pools of colour leaning toward the pointer. Press and hold (or hold Space) and the surface melts through a displacement map; let go and it snaps back like jelly, overshooting before it settles.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { SvgNoise, SvgNoiseShader } from "@/components/svg-noise-shader";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/svg-noise-shader/index.ts ---

```ts
export { SvgNoise, SvgNoiseShader } from "./svg-noise-shader";
export type { SvgNoiseProps } from "./svg-noise-shader";
```

--- components/svg-noise-shader/svg-noise-shader.tsx ---

```tsx
"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface SvgNoiseProps {
  /** Up to four colours for the glowing pools under the grain. */
  colors?: string[];
  /** Strength of the film grain, 0 to 1. */
  grain?: number;
  /** How far the surface melts while held, in px of displacement. */
  distortion?: number;
  /** Speed multiplier for the flowing turbulence. */
  speed?: number;
  /** Content over the surface. Defaults to a title. */
  children?: ReactNode;
  /** Caption under the default title. Pass an empty string to hide it. */
  hint?: string;
  /** Holds and releases the surface every few seconds until someone touches it. */
  autoplay?: boolean;
  className?: string;
}

const DEFAULT_COLORS = ["#5e5ce6", "#ff375f", "#0a84ff", "#ff9f0a"];
const SPOTS = [
  [22, 28, 58],
  [78, 72, 52],
  [70, 18, 40],
  [28, 82, 44],
];

/**
 * A grainy gradient surface built from SVG feTurbulence: animated film grain
 * over soft pools of colour that lean toward the pointer. Press and hold and
 * the surface melts, flowing through a displacement map; let go and it snaps
 * back like jelly, overshooting before it settles.
 */
export function SvgNoise({
  colors = DEFAULT_COLORS,
  grain = 0.35,
  distortion = 90,
  speed = 1,
  children,
  hint = "Press and hold to melt it.",
  autoplay = false,
  className,
}: SvgNoiseProps) {
  const id = useId().replace(/:/g, "");
  const still = useReducedMotion() === true;
  const turb = useRef<SVGFETurbulenceElement>(null);
  const disp = useRef<SVGFEDisplacementMapElement>(null);
  const run = useRef<AnimationPlaybackControls | undefined>(undefined);
  const touched = useRef(false);
  const [held, setHeld] = useState(false);

  const melt = useMotionValue(0);
  const squash = useTransform(melt, (m) => 1 - Math.max(-0.4, Math.min(1, m)) * 0.03);
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const px = useSpring(50, { stiffness: 90, damping: 16 });
  const py = useSpring(50, { stiffness: 90, damping: 16 });
  const lean = useTransform(px, (v) => (v - 50) * 0.25);
  const leanY = useTransform(py, (v) => (v - 50) * 0.25);
  const sheen = useMotionTemplate`radial-gradient(260px circle at ${px}% ${py}%, rgba(255,255,255,.16), transparent 70%)`;

  useMotionValueEvent(melt, "change", (m) => disp.current?.setAttribute("scale", String(Math.round(m * distortion * 10) / 10)));

  const press = (on: boolean) => {
    setHeld(on);
    run.current?.stop();
    if (still) {
      melt.set(on ? 0.6 : 0);
      return;
    }
    // Soft on the way in; stiff and loose on release so it overshoots past flat.
    run.current = animate(melt, on ? 1 : 0, on ? { type: "spring", stiffness: 110, damping: 16 } : { type: "spring", stiffness: 320, damping: 9 });
  };

  // Turbulence flows and the grain jitters in one rAF loop that writes straight to the DOM.
  useEffect(() => {
    if (still) return;
    let raf = 0;
    let last = performance.now();
    let t = 0;
    let tick = 0;
    let frame = 0;
    let demo = 0;
    let demoOn = false;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt * speed;
      if (Math.abs(melt.get()) > 0.01) {
        const fx = 0.009 + 0.003 * Math.sin(t * 0.9);
        const fy = 0.016 + 0.004 * Math.cos(t * 0.7);
        turb.current?.setAttribute("baseFrequency", `${fx.toFixed(5)} ${fy.toFixed(5)}`);
      }
      tick += dt;
      if (tick > 0.07) {
        tick = 0;
        frame++;
        // Cheap hashed offsets: the grain tile hops to a new spot each frame like film.
        gx.set(((frame * 37) % 23) - 11);
        gy.set(((frame * 53) % 19) - 9);
      }
      if (autoplay && !touched.current) {
        demo += dt;
        if (!demoOn && demo > 1.6) {
          demoOn = true;
          demo = 0;
          run.current?.stop();
          run.current = animate(melt, 1, { type: "spring", stiffness: 110, damping: 16 });
          px.set(64);
          py.set(40);
        } else if (demoOn && demo > 1.4) {
          demoOn = false;
          demo = 0;
          run.current?.stop();
          run.current = animate(melt, 0, { type: "spring", stiffness: 320, damping: 9 });
          px.set(40);
          py.set(62);
        }
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      run.current?.stop();
    };
  }, [still, speed, autoplay, melt, gx, gy, px, py]);

  const pools = SPOTS.map(([x, y, r], i) => `radial-gradient(${r}% ${r + 8}% at ${x}% ${y}%, ${colors[i % Math.max(1, colors.length)] ?? DEFAULT_COLORS[i]}, transparent 70%)`).join(", ");
  const g = Math.max(0, Math.min(1, grain));

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label="Noise surface. Press and hold to melt it."
      aria-pressed={held}
      onPointerDown={(e) => {
        touched.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        press(true);
      }}
      onPointerUp={() => press(false)}
      onPointerCancel={() => press(false)}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        touched.current = true;
        px.set(((e.clientX - r.left) / r.width) * 100);
        py.set(((e.clientY - r.top) / r.height) * 100);
      }}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          touched.current = true;
          press(true);
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") press(false);
      }}
      style={{ scale: squash }}
      className={cn(
        "relative isolate flex h-[340px] w-full max-w-[520px] cursor-pointer touch-none select-none items-center justify-center overflow-hidden rounded-[24px] bg-[#0b0b12] text-white outline-none",
        "shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]",
        "focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f5f7] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black",
        className,
      )}
    >
      <svg aria-hidden className="absolute h-0 w-0">
        <defs>
          <filter id={`warp-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence ref={turb} type="fractalNoise" baseFrequency="0.009 0.016" numOctaves={2} seed={3} result="n" />
            <feDisplacementMap ref={disp} in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id={`grain-${id}`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 -0.18" />
          </filter>
        </defs>
      </svg>

      <div aria-hidden className="absolute inset-[-12%] -z-20" style={{ filter: `url(#warp-${id})` }}>
        <motion.div className="absolute inset-0" style={{ x: lean, y: leanY, backgroundImage: pools }} />
        <div className="absolute inset-0 opacity-45 mix-blend-soft-light [background-image:repeating-linear-gradient(115deg,rgba(255,255,255,.5)_0_2px,transparent_3px_18px)]" />
      </div>
      <motion.div aria-hidden className="pointer-events-none absolute -inset-6 -z-10 mix-blend-overlay" style={{ x: gx, y: gy, opacity: g }}>
        <svg className="h-full w-full">
          <rect width="100%" height="100%" filter={`url(#grain-${id})`} />
        </svg>
      </motion.div>
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: sheen }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,.45))]" />

      {children ?? (
        <div className="pointer-events-none px-6 text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-white/75">SVG noise</p>
          <h2 className="mt-2 text-[56px] font-semibold leading-none tracking-[-0.05em]">Grain.</h2>
          {hint ? <p className="mt-3 text-[13px] text-white/75">{hint}</p> : null}
        </div>
      )}
    </motion.div>
  );
}

/** Alias that matches the component's catalog name. */
export const SvgNoiseShader = SvgNoise;
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
