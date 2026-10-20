"use client";

import * as React from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export type CursorTextRevealProps = {
  /** Text everyone sees. */
  baseText: string;
  /** Text revealed inside the lens. Defaults to baseText. */
  revealText?: string;
  /** Optional image URL behind the base text (you supply it; nothing is fetched by default). */
  backgroundImage?: string;
  /** CSS background-position for backgroundImage. */
  backgroundPosition?: string;
  /** Image URL shown inside the lens in image mode. Without it, a built-in gradient is used. */
  revealImage?: string;
  /** CSS background-position for revealImage. */
  revealImagePosition?: string;
  /** "text": the lens shows the reveal text on an ink backdrop. "image": on an image or gradient. */
  mode?: "text" | "image";
  /** Lens radius in px while the pointer is over the card. */
  maskSize?: number;
  /** Lens radius in px at rest (0 hides it). */
  initialMaskSize?: number;
  /** 0.04 to 0.6. Lower is snappier, higher drifts behind the pointer. */
  smoothness?: number;
  baseTextClassName?: string;
  revealTextClassName?: string;
  /** Classes for the card. */
  containerClassName?: string;
  /** Classes for both text wrappers. */
  className?: string;
  /** CSS font-size for both text layers. */
  fontSize?: string;
  align?: "left" | "center" | "right";
  /** Thin ring around the lens edge. */
  enableGlow?: boolean;
  /** Classes for the lens backdrop; replaces the default ink fill. */
  revealBackgroundClassName?: string;
  /** Moves the lens along a slow figure-eight until a real pointer arrives. */
  autoplay?: boolean;
  /** @deprecated No longer used. */
  showAmbient?: boolean;
  /** @deprecated No longer used. */
  showGrid?: boolean;
};

const alignClass = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
} as const;

/** tailwind-merge drops a default `leading-*` whenever a later `text-*` size arrives, so the default goes last unless the caller set one. */
const withLeading = (cls: string | undefined, fallback: string) => (/(^|\s)([\w-]+:)*leading-/.test(cls ?? "") ? undefined : fallback);

/** Trailing droplets: radius relative to the lens, and how loosely each one follows the one before. */
const DROPS = [
  { k: 0.6, stiffness: 170, damping: 19 },
  { k: 0.4, stiffness: 130, damping: 17 },
  { k: 0.24, stiffness: 100, damping: 15 },
];

/** One hard-edged circle of the mask. */
const useCircle = (r: MotionValue<number>, x: MotionValue<number>, y: MotionValue<number>) =>
  useMotionTemplate`radial-gradient(circle ${r}px at ${x}px ${y}px, #000 calc(100% - 1.5px), transparent 100%)`;

/**
 * An ink lens that follows the pointer and shows a second sentence through it. The lens drags a
 * tail of droplets behind it on looser and looser springs, so fast moves stretch it into a drip
 * that catches up when you stop. Press (or Space) floods the whole card with the reveal and lets
 * go with an overshoot.
 */
export function CursorTextReveal({
  baseText,
  revealText,
  backgroundImage,
  backgroundPosition = "center",
  revealImage,
  revealImagePosition = "center",
  mode = "text",
  maskSize = 120,
  initialMaskSize = 0,
  smoothness = 0.18,
  baseTextClassName,
  revealTextClassName,
  containerClassName,
  className,
  fontSize = "clamp(2rem, 5.2vw, 3.6rem)",
  align = "center",
  enableGlow = true,
  revealBackgroundClassName,
  autoplay = false,
}: CursorTextRevealProps) {
  const still = useReducedMotion() === true;
  const root = React.useRef<HTMLDivElement>(null);
  const touched = React.useRef(false);
  const flooding = React.useRef(false);
  const run = React.useRef<AnimationPlaybackControls | undefined>(undefined);

  const sm = Math.max(0.04, Math.min(smoothness, 0.6));
  const follow = { stiffness: Math.round(95 / sm), damping: Math.round(22 + sm * 70), mass: 0.45 + sm };
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const lx = useSpring(x, follow);
  const ly = useSpring(y, follow);
  const d1x = useSpring(lx, DROPS[0]!);
  const d1y = useSpring(ly, DROPS[0]!);
  const d2x = useSpring(d1x, DROPS[1]!);
  const d2y = useSpring(d1y, DROPS[1]!);
  const d3x = useSpring(d2x, DROPS[2]!);
  const d3y = useSpring(d2y, DROPS[2]!);

  const size = useMotionValue(initialMaskSize);
  const r0 = useTransform(size, (v) => Math.max(0.01, v));
  const r1 = useTransform(size, (v) => Math.max(0.01, flooding.current ? 0 : v * DROPS[0]!.k));
  const r2 = useTransform(size, (v) => Math.max(0.01, flooding.current ? 0 : v * DROPS[1]!.k));
  const r3 = useTransform(size, (v) => Math.max(0.01, flooding.current ? 0 : v * DROPS[2]!.k));
  const m0 = useCircle(r0, lx, ly);
  const m1 = useCircle(r1, d1x, d1y);
  const m2 = useCircle(r2, d2x, d2y);
  const m3 = useCircle(r3, d3x, d3y);
  const mask = useMotionTemplate`${m0}, ${m1}, ${m2}, ${m3}`;
  const ring = useTransform(r0, (v) => v * 2);
  const ringOpacity = useTransform(size, (v) => (flooding.current ? 0 : Math.min(1, v / 40)));

  const grow = React.useCallback(
    (to: number) => {
      run.current?.stop();
      run.current = animate(size, to, still ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 20, mass: 0.8 });
    },
    [size, still],
  );

  const point = (e: React.PointerEvent) => {
    const r = root.current?.getBoundingClientRect();
    if (!r) return;
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };

  const flood = (on: boolean) => {
    const r = root.current?.getBoundingClientRect();
    flooding.current = on;
    grow(on && r ? Math.hypot(r.width, r.height) : maskSize);
  };

  // Park the lens in the middle, and run the figure-eight demo until someone points.
  React.useEffect(() => {
    const el = root.current;
    if (!el) return;
    const centre = () => {
      const r = el.getBoundingClientRect();
      if (!touched.current) {
        x.set(r.width / 2);
        y.set(r.height / 2);
      }
    };
    centre();
    const ro = new ResizeObserver(centre);
    ro.observe(el);
    let raf = 0;
    if (autoplay && !still) {
      grow(maskSize);
      const t0 = performance.now();
      const loop = (now: number) => {
        if (touched.current) return;
        const r = el.getBoundingClientRect();
        const t = (now - t0) / 1000;
        x.set(r.width / 2 + Math.sin(t * 0.9) * r.width * 0.32);
        y.set(r.height / 2 + Math.sin(t * 1.8) * r.height * 0.18);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      run.current?.stop();
    };
  }, [autoplay, still, maskSize, grow, x, y]);

  const contentText = revealText ?? baseText;
  const layout = cn("relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-12 sm:px-10", alignClass[align], className);
  const heading = cn("m-0 max-w-[18ch] text-balance font-semibold tracking-[-0.04em] select-none", align === "center" && "mx-auto", align === "right" && "ml-auto");

  return (
    <div
      ref={root}
      tabIndex={0}
      role="group"
      aria-roledescription="reveal card"
      aria-label={`${baseText} Press Space to reveal: ${contentText}`}
      className={cn(
        "relative isolate flex min-h-[320px] w-full cursor-none touch-pan-y overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black sm:min-h-[380px]",
        alignClass[align],
        containerClassName,
      )}
      onPointerEnter={(e) => {
        touched.current = true;
        point(e);
        if (!flooding.current) grow(maskSize);
      }}
      onPointerMove={(e) => {
        touched.current = true;
        point(e);
      }}
      onPointerLeave={() => {
        flooding.current = false;
        grow(initialMaskSize);
      }}
      onPointerDown={(e) => {
        touched.current = true;
        point(e);
        flood(true);
      }}
      onPointerUp={() => flood(false)}
      onPointerCancel={() => flood(false)}
      onFocus={() => {
        if (!touched.current) grow(maskSize);
      }}
      onBlur={() => {
        if (flooding.current) flood(false);
      }}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          touched.current = true;
          flood(!flooding.current);
        }
      }}
    >
      {backgroundImage ? (
        <div aria-hidden="true" className="absolute inset-0 bg-cover" style={{ backgroundImage: `url(${backgroundImage})`, backgroundPosition }} />
      ) : null}

      <div className={layout}>
        <p className={cn(heading, "text-[#1d1d1f] dark:text-[#f5f5f7]", baseTextClassName, withLeading(baseTextClassName, "leading-[1.02]"))} style={{ fontSize }}>
          {baseText}
        </p>
      </div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 flex overflow-hidden"
        style={{ WebkitMaskImage: mask, maskImage: mask }}
      >
        <div
          className={cn(
            "absolute inset-0",
            revealBackgroundClassName ?? (mode === "image" ? undefined : "bg-[#1d1d1f] dark:bg-[#f5f5f7]"),
          )}
          style={
            mode === "image" && !revealBackgroundClassName
              ? revealImage
                ? { backgroundImage: `url(${revealImage})`, backgroundPosition: revealImagePosition, backgroundSize: "cover" }
                : { background: "radial-gradient(120% 90% at 30% 20%, #ffd60a 0%, #ff9f0a 24%, #ff375f 48%, #bf5af2 70%, #0a84ff 100%)" }
              : undefined
          }
        />
        <div className={layout}>
          <p
            className={cn(
              heading,
              mode === "image" ? "text-white [text-shadow:0_8px_30px_rgba(0,0,0,.25)]" : "text-white dark:text-[#1d1d1f]",
              revealTextClassName,
              withLeading(revealTextClassName, "leading-[1.02]"),
            )}
            style={{ fontSize }}
          >
            {contentText}
          </p>
        </div>
      </motion.div>

      {enableGlow ? (
        <motion.div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-30" style={{ x: lx, y: ly, opacity: ringOpacity }}>
          <motion.div
            className="-translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_1px_rgba(0,113,227,.35),0_12px_32px_-8px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(10,132,255,.45),0_12px_32px_-8px_rgba(0,0,0,.6)]"
            style={{ width: ring, height: ring }}
          />
        </motion.div>
      ) : null}
    </div>
  );
}

export default CursorTextReveal;
