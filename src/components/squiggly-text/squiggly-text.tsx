"use client";

import * as React from "react";
import { animate, motion, useMotionValue, useReducedMotion, useSpring, type AnimationPlaybackControls } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Hand-drawn "line boil" text. One SVG turbulence + displacement filter re-rolls its noise seed
 * every `stepDuration` ms, like a stop-motion pencil drawing. Moving the pointer across the text
 * stirs the ink: the displacement jumps with pointer speed and settles back on a spring. All of it
 * is written straight to the filter's attributes, so React never re-renders while it boils.
 */

const safeId = (raw: string) => raw.replace(/[^a-zA-Z0-9_-]/g, "");

/** Squiggle underline in a 0..200 x 0..20 box, drawn once so server and client print the same path. */
const UNDERLINE = "M2 12 C 22 4, 38 18, 58 10 S 96 4, 116 11 S 156 18, 176 9 S 194 8, 198 10";

export type SquigglyWordProps = {
  children: React.ReactNode;
  className?: string;
  /** How many different noise frames the boil cycles through. */
  steps?: number;
  /** Milliseconds each frame is held. Lower is jumpier. */
  stepDuration?: number;
  /** Resting displacement in px. A pair alternates between the two values frame by frame. */
  scale?: number | readonly [number, number];
  /** Noise frequency. Higher makes tighter wiggles. */
  baseFrequency?: number;
  /** Noise detail (1 to 5). */
  numOctaves?: number;
  /** Extra displacement added per unit of pointer speed while the pointer moves over the text. */
  stir?: number;
  /** Draws a hand-drawn squiggle under the text that redraws itself when stirred. */
  underline?: boolean;
  /** Underline colour (any CSS colour). Defaults to the accent blue. */
  underlineColor?: string;
  /** Stirs the ink and redraws the underline every 2.8s until someone points at it. */
  autoplay?: boolean;
};

/** One boiling fragment. Use it inside a heading to wobble a single word or phrase. */
export function SquigglyWord({
  children,
  className,
  steps = 5,
  stepDuration = 80,
  scale = [6, 8],
  baseFrequency = 0.02,
  numOctaves = 3,
  stir = 0.06,
  underline = false,
  underlineColor,
  autoplay = false,
}: SquigglyWordProps) {
  const still = useReducedMotion() === true;
  const id = `sq-${safeId(React.useId())}`;
  const turb = React.useRef<SVGFETurbulenceElement>(null);
  const disp = React.useRef<SVGFEDisplacementMapElement>(null);
  const last = React.useRef<{ x: number; y: number; t: number } | null>(null);
  const touched = React.useRef(false);
  const run = React.useRef<AnimationPlaybackControls | undefined>(undefined);
  /** Extra displacement on top of the resting scale; kicked with velocity so it rings and settles. */
  const excite = useMotionValue(0);
  const draw = useMotionValue(still ? 1 : 0);
  const drawn = useSpring(draw, { stiffness: 90, damping: 16 });

  const frames = Math.max(1, Math.round(steps));
  const s0 = typeof scale === "number" ? scale : scale[0];
  const s1 = typeof scale === "number" ? scale : (scale[1] ?? scale[0]);

  // The boil: one interval swaps the seed; a motion-value listener feeds the stir into the scale.
  React.useEffect(() => {
    let frame = 0;
    const paint = () => {
      const base = frame % 2 ? s1 : s0;
      disp.current?.setAttribute("scale", String(Math.round((base + Math.abs(excite.get())) * 100) / 100));
    };
    paint();
    if (still) return;
    const t = window.setInterval(() => {
      frame = (frame + 1) % frames;
      turb.current?.setAttribute("seed", String(frame + 1));
      paint();
    }, Math.max(16, Math.round(stepDuration)));
    const off = excite.on("change", paint);
    return () => {
      window.clearInterval(t);
      off();
    };
  }, [excite, frames, s0, s1, stepDuration, still]);

  // Draw the underline in shortly after mount.
  React.useEffect(() => {
    if (still) return;
    const t = window.setTimeout(() => draw.set(1), 250);
    return () => {
      window.clearTimeout(t);
      run.current?.stop();
    };
  }, [draw, still]);

  /** A velocity impulse into an under-damped spring: the ink jumps, overshoots and calms down. */
  const pulse = React.useCallback(
    (amount: number) => {
      if (still) return;
      run.current?.stop();
      run.current = animate(excite, 0, { type: "spring", stiffness: 140, damping: 9, velocity: amount * 10 });
    },
    [excite, still],
  );

  const redraw = React.useCallback(() => {
    if (still || !underline) return;
    draw.jump(0);
    drawn.jump(0);
    draw.set(1);
  }, [draw, drawn, still, underline]);

  React.useEffect(() => {
    if (!autoplay || still) return;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      pulse(14);
      redraw();
    }, 2800);
    return () => window.clearInterval(t);
  }, [autoplay, pulse, redraw, still]);

  const filter = still ? undefined : `url(#${id})`;

  return (
    <span
      className={cn("relative inline-block", className)}
      onPointerEnter={() => {
        touched.current = true;
        redraw();
      }}
      onPointerMove={(e) => {
        const now = e.timeStamp;
        const prev = last.current;
        last.current = { x: e.clientX, y: e.clientY, t: now };
        if (!prev || now - prev.t > 120) return;
        const speed = Math.hypot(e.clientX - prev.x, e.clientY - prev.y) / Math.max(1, now - prev.t);
        if (speed > 0.05) pulse(Math.min(18, speed * 1000 * stir * 0.12));
      }}
      onPointerLeave={() => {
        last.current = null;
      }}
    >
      <svg aria-hidden="true" focusable="false" className="pointer-events-none absolute h-0 w-0 overflow-hidden">
        <defs>
          <filter id={id} x="-20%" y="-30%" width="140%" height="160%" colorInterpolationFilters="sRGB">
            <feTurbulence ref={turb} type="fractalNoise" baseFrequency={String(Math.max(0.001, baseFrequency))} numOctaves={Math.max(1, Math.min(5, Math.round(numOctaves)))} seed="1" result="noise" />
            <feDisplacementMap ref={disp} in="SourceGraphic" in2="noise" scale={String(s0)} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <span className="relative inline-block" style={{ filter, WebkitFilter: filter }}>
        {children}
        {underline ? (
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 200 20"
            preserveAspectRatio="none"
            className="pointer-events-none absolute -bottom-[0.18em] left-0 h-[0.28em] w-full overflow-visible"
          >
            <motion.path
              d={UNDERLINE}
              fill="none"
              strokeWidth={4}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className={underlineColor ? undefined : "stroke-[#0071e3] dark:stroke-[#0a84ff]"}
              style={{ pathLength: drawn, stroke: underlineColor }}
            />
          </svg>
        ) : null}
      </span>
    </span>
  );
}

export type SquigglyTextProps = Omit<SquigglyWordProps, "children" | "className"> & {
  children?: React.ReactNode;
  /** Convenience text when no children are given. */
  text?: string;
  /** Root element. */
  as?: "span" | "div";
  /** Classes for the root element. */
  className?: string;
  /** Classes for the boiling text node. */
  textClassName?: string;
};

/** A whole line (or block) of boiling text. */
export function SquigglyText({ children, text, as = "span", className, textClassName, ...word }: SquigglyTextProps) {
  const Tag = as === "div" ? "div" : "span";
  return (
    <Tag className={cn("relative inline-block max-w-full overflow-visible", className)}>
      <SquigglyWord {...word} className={cn("inline-block", textClassName)}>
        {children ?? text}
      </SquigglyWord>
    </Tag>
  );
}

/** tailwind-merge drops a default `leading-*` whenever a later `text-*` size arrives, so the default goes last unless the caller set one. */
const withLeading = (cls: string | undefined, fallback: string) => (/(^|\s)([\w-]+:)*leading-/.test(cls ?? "") ? undefined : fallback);

export type SquigglyDrinksHeadlineProps = {
  className?: string;
  headingClassName?: string;
  steps?: number;
  stepDuration?: number;
  baseFrequency?: number;
  numOctaves?: number;
  /** Text before the boiling phrase. */
  lead?: string;
  /** The phrase that boils and gets the underline. */
  phrase?: string;
  /** Text after the boiling phrase. */
  tail?: string;
  /** Stirs the phrase every 2.8s until someone points at it. */
  autoplay?: boolean;
};

/** Ready-made hero headline: plain lead, a boiling underlined phrase, a plain tail. */
export function SquigglyDrinksHeadline({
  className,
  headingClassName,
  steps = 5,
  stepDuration = 90,
  baseFrequency = 0.022,
  numOctaves = 3,
  lead = "Interfaces with",
  phrase = "a little life",
  tail = "in every line.",
  autoplay = false,
}: SquigglyDrinksHeadlineProps) {
  return (
    <h2
      className={cn(
        "m-0 max-w-[14ch] text-balance text-center text-[44px] font-semibold tracking-[-0.035em] text-[#1d1d1f] sm:text-[56px] dark:text-[#f5f5f7]",
        headingClassName,
        className,
        withLeading(`${headingClassName ?? ""} ${className ?? ""}`, "leading-[1.06]"),
      )}
    >
      {lead}{" "}
      <SquigglyWord steps={steps} stepDuration={stepDuration} baseFrequency={baseFrequency} numOctaves={numOctaves} scale={[3, 4.5]} underline autoplay={autoplay} className="text-[#0071e3] dark:text-[#0a84ff]">
        {phrase}
      </SquigglyWord>{" "}
      {tail}
    </h2>
  );
}
