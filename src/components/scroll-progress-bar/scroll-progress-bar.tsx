"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";

export type ScrollProgressBarProps = {
  /** Section whose trip through the viewport drives the fill (0 when its top meets the top, 1 when its bottom meets the bottom). */
  targetRef?: RefObject<HTMLElement | null>;
  /** Scrollable parent, when the bar tracks a panel instead of the page. */
  containerRef?: RefObject<HTMLElement | null>;
  /** Your own 0..1 progress. Overrides scroll tracking. */
  progress?: MotionValue<number>;
  /** Track colour. Defaults to #e8e8ed (#3a3a3c in dark mode). */
  backgroundColor?: string;
  /** Fill, bead and marker colour. Defaults to #0071e3 (#0a84ff in dark mode). */
  fillColor?: string;
  /** "vertical" (default) or "horizontal". */
  orientation?: "vertical" | "horizontal";
  /** Vertical: rail length. Horizontal: rail thickness. */
  height?: number | string;
  /** Vertical: rail thickness. Horizontal: rail length. */
  width?: number | string;
  /** Milestone dots spread evenly along the rail (ends included). */
  markerCount?: number;
  /** Milestone dot diameter, px. */
  markerSize?: number;
  showMarkers?: boolean;
  /** One label per marker. Labels become buttons that scroll to their chapter. */
  labels?: string[];
  /** Draw the bead that rides the tip of the fill and stretches with scroll speed. */
  showHead?: boolean;
  /** Spring stiffness for the fill. */
  stiffness?: number;
  /** Spring damping for the fill. */
  damping?: number;
  /** Called with the progress (0..1) when a label is clicked, before the bar scrolls there. */
  onSeek?: (progress: number) => void;
  /** Scrolls the container (or plays the fill on its own) until someone scrolls, clicks or presses a key. */
  autoplay?: boolean;
  className?: string;
  ariaLabel?: string;
};

const len = (v: number | string) => (typeof v === "number" ? `${v}px` : v);

function Marker({
  at,
  vertical,
  progress,
  size,
  fill,
  track,
  still,
}: {
  at: number;
  vertical: boolean;
  progress: MotionValue<number>;
  size: number;
  fill?: string;
  track?: string;
  still: boolean;
}) {
  const on = useTransform(progress, (v): number => (v + 0.004 >= at ? 1 : 0));
  const pop = useSpring(on, still ? { stiffness: 2000, damping: 100 } : { stiffness: 520, damping: 13 });
  const dot = useTransform(pop, (v) => Math.max(0, v));
  const ring = useTransform(pop, [0, 1], [1, 1.12]);
  return (
    <motion.span
      aria-hidden
      className="absolute flex items-center justify-center rounded-full border-2 border-[#d2d2d7] bg-white dark:border-[#48484a] dark:bg-[#1c1c1e]"
      style={{
        width: size,
        height: size,
        left: vertical ? "50%" : `${at * 100}%`,
        top: vertical ? `${at * 100}%` : "50%",
        x: "-50%",
        y: "-50%",
        scale: ring,
        borderColor: track,
      }}
    >
      <motion.span
        className="absolute -inset-[2px] rounded-full bg-[#0071e3] dark:bg-[#0a84ff]"
        style={{ scale: dot, backgroundColor: fill }}
      />
    </motion.span>
  );
}

/**
 * A progress rail for long reads. The fill springs along as you scroll, a bead
 * rides its tip and stretches with your speed, and each milestone dot pops in
 * as you pass it. Optional labels jump to their chapter.
 */
export function ScrollProgressBar({
  targetRef,
  containerRef,
  progress,
  backgroundColor,
  fillColor,
  orientation = "vertical",
  height,
  width,
  markerCount = 4,
  markerSize = 10,
  showMarkers = true,
  labels,
  showHead = true,
  stiffness = 150,
  damping = 26,
  onSeek,
  autoplay = false,
  className = "",
  ariaLabel = "Section scroll progress",
}: ScrollProgressBarProps) {
  const still = useReducedMotion() === true;
  const vertical = orientation !== "horizontal";
  const h = height ?? (vertical ? 206 : 4);
  const w = width ?? (vertical ? 4 : "100%");
  const { scrollYProgress } = useScroll(
    targetRef ? { container: containerRef, target: targetRef, offset: ["start start", "end end"] } : { container: containerRef },
  );
  const real = progress ?? scrollYProgress;
  const shown = useMotionValue(0);
  const smooth = useSpring(shown, still ? { stiffness: 3000, damping: 200 } : { stiffness, damping, mass: 0.22 });
  const velocity = useVelocity(smooth);
  const stretch = useTransform(velocity, (v) => (still ? 1 : 1 + Math.min(Math.abs(v) * 0.9, 1.4)));
  const squash = useTransform(stretch, (s) => 1 / Math.sqrt(s));
  const tip = useTransform(smooth, (v) => `${Math.max(0, Math.min(1, v)) * 100}%`);
  const root = useRef<HTMLDivElement>(null);
  const demoing = useRef(false);
  const count = showMarkers ? Math.max(labels?.length ?? 0, markerCount) : 0;

  // The rail shows `shown`; it mirrors the real progress unless the demo is driving it.
  useEffect(() => {
    shown.set(real.get());
    return real.on("change", (v) => {
      if (!demoing.current) shown.set(v);
    });
  }, [real, shown]);

  useMotionValueEvent(smooth, "change", (v) => {
    root.current?.setAttribute("aria-valuenow", String(Math.round(Math.max(0, Math.min(1, v)) * 100)));
  });

  useEffect(() => {
    if (!autoplay || progress) return;
    const el = containerRef?.current ?? null;
    const scroller: HTMLElement | Window = el ?? window;
    let run: AnimationPlaybackControls | undefined;
    let wait: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    const stop = () => {
      if (stopped) return;
      stopped = true;
      demoing.current = false;
      run?.stop();
      clearTimeout(wait);
      shown.set(real.get());
    };
    const events = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
    events.forEach((e) => scroller.addEventListener(e, stop, { passive: true }));
    const stops = [0.34, 0.67, 1, 0];
    let k = 0;
    const step = () => {
      if (stopped) return;
      const to = stops[k++ % stops.length];
      if (el) {
        const max = el.scrollHeight - el.clientHeight;
        if (max <= 0) return;
        const from = el.scrollTop / max;
        run = animate(from, to, {
          duration: to === 0 ? 1.6 : 1.3,
          ease: [0.45, 0, 0.2, 1],
          onUpdate: (v) => {
            el.scrollTop = v * max;
          },
          onComplete: () => {
            wait = setTimeout(step, 1100);
          },
        });
      } else {
        demoing.current = true;
        run = animate(shown, to, { duration: to === 0 ? 1.6 : 1.3, ease: [0.45, 0, 0.2, 1], onComplete: () => {
            wait = setTimeout(step, 1100);
          },
        });
      }
    };
    wait = setTimeout(step, 900);
    return () => {
      stopped = true;
      demoing.current = false;
      run?.stop();
      clearTimeout(wait);
      events.forEach((e) => scroller.removeEventListener(e, stop));
    };
  }, [autoplay, progress, containerRef, real, shown]);

  const seek = (f: number) => {
    onSeek?.(f);
    const el = containerRef?.current ?? null;
    const target = targetRef?.current ?? null;
    const smoothly = still ? "auto" : "smooth";
    if (el) {
      if (target) {
        const top = target.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
        el.scrollTo({ top: top + f * Math.max(0, target.offsetHeight - el.clientHeight), behavior: smoothly });
      } else el.scrollTo({ top: f * (el.scrollHeight - el.clientHeight), behavior: smoothly });
    } else if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + f * Math.max(0, target.offsetHeight - window.innerHeight), behavior: smoothly });
    } else {
      window.scrollTo({ top: f * (document.documentElement.scrollHeight - window.innerHeight), behavior: smoothly });
    }
  };

  const thickness = vertical ? w : h;
  const headSize = markerSize + 6;
  const at = (i: number) => (count <= 1 ? 0 : i / (count - 1));

  return (
    <div
      className={`relative flex ${vertical ? "flex-row" : "flex-col"} ${className}`}
      style={vertical ? { height: len(h) } : { width: len(w) }}
    >
      <div
        ref={root}
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        className="relative shrink-0"
        style={vertical ? { height: "100%", width: len(thickness) } : { width: "100%", height: len(thickness) }}
      >
        <span
          aria-hidden
          className="absolute inset-0 overflow-hidden rounded-full bg-[#e8e8ed] dark:bg-[#3a3a3c]"
          style={{ backgroundColor }}
        >
          <motion.span
            className={`absolute inset-0 block rounded-full bg-[#0071e3] dark:bg-[#0a84ff] ${vertical ? "origin-top" : "origin-left"}`}
            style={vertical ? { scaleY: smooth, backgroundColor: fillColor } : { scaleX: smooth, backgroundColor: fillColor }}
          />
        </span>
        {Array.from({ length: count }, (_, i) => (
          <Marker key={i} at={at(i)} vertical={vertical} progress={smooth} size={markerSize} fill={fillColor} track={backgroundColor} still={still} />
        ))}
        {showHead && (
          <motion.span
            aria-hidden
            className="absolute z-10 rounded-full bg-white shadow-[0_0_0_2.5px_var(--spb-fill),0_4px_12px_-2px_var(--spb-glow)] [--spb-fill:#0071e3] [--spb-glow:rgba(0,113,227,.55)] dark:bg-[#f5f5f7] dark:[--spb-fill:#0a84ff] dark:[--spb-glow:rgba(10,132,255,.6)]"
            style={{
              width: headSize,
              height: headSize,
              left: vertical ? "50%" : tip,
              top: vertical ? tip : "50%",
              x: "-50%",
              y: "-50%",
              scaleY: vertical ? stretch : squash,
              scaleX: vertical ? squash : stretch,
              ...(fillColor ? ({ "--spb-fill": fillColor, "--spb-glow": `${fillColor}88` } as Record<string, string>) : null),
            }}
          />
        )}
      </div>
      {labels && labels.length > 0 && (
        <div className={`relative ${vertical ? "ml-3 h-full" : "mt-3 h-6 w-full"}`}>
          {vertical && (
            // Invisible copy in normal flow so the column is as wide as its longest label.
            <span aria-hidden className="invisible flex flex-col pl-1 pr-2 text-[13px] font-medium tracking-[-0.01em]">
              {labels.map((label, i) => (
                <span key={label + i} className="h-0 overflow-hidden whitespace-nowrap">
                  {label}
                </span>
              ))}
            </span>
          )}
          {labels.map((label, i) => (
            <Label key={label + i} label={label} at={at(i)} next={i < labels.length - 1 ? at(i + 1) : 1.01} vertical={vertical} progress={smooth} onSeek={() => seek(at(i))} />
          ))}
        </div>
      )}
    </div>
  );
}

function Label({
  label,
  at,
  next,
  vertical,
  progress,
  onSeek,
}: {
  label: string;
  at: number;
  next: number;
  vertical: boolean;
  progress: MotionValue<number>;
  onSeek: () => void;
}) {
  const current = useTransform(progress, (v): number => (v + 0.004 >= at && v + 0.004 < next ? 1 : 0));
  const lit = useSpring(current, { stiffness: 400, damping: 30 });
  const opacity = useTransform(lit, [0, 1], [0.55, 1]);
  const nudge = useTransform(lit, [0, 1], [0, 4]);
  return (
    <motion.button
      type="button"
      onClick={onSeek}
      className="absolute whitespace-nowrap rounded-md px-1 text-left text-[13px] font-medium tracking-[-0.01em] text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
      style={
        vertical
          ? { top: `${at * 100}%`, left: 0, y: "-50%", x: nudge, opacity }
          : { left: `${at * 100}%`, top: 0, x: at === 0 ? "0%" : at === 1 ? "-100%" : "-50%", y: nudge, opacity }
      }
    >
      {label}
    </motion.button>
  );
}
