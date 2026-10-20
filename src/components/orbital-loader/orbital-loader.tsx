"use client";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

export type OrbitalLoaderProps = {
  /** Diameter in px. */
  size?: number;
  /** 0–1 for a ring that fills to progress; leave out for an endless orbit. At 1 it turns into a tick. */
  progress?: number;
  /** Status lines cycled under the loader. One line stays fixed; [] hides them. */
  messages?: string[];
  /** Line shown once progress reaches 1. */
  doneMessage?: string;
  /** Accent colour of the arc and comet. Defaults to system blue. */
  color?: string;
  /** Called once when progress reaches 1. */
  onComplete?: () => void;
  /** Runs a pretend upload from 0 to 100%, ticks, and starts again, until someone clicks the loader. */
  autoplay?: boolean;
  className?: string;
};

const MESSAGES = ["Warming up the build", "Fetching your components", "Compiling styles", "Almost there"];
const VB = 120;
const C = VB / 2;
const R = 50;
const TAIL = 9;
/** Pretend-upload steps for autoplay: [progress, ms to hold]. */
const DEMO: [number, number][] = [
  [0.08, 500],
  [0.27, 700],
  [0.34, 400],
  [0.62, 800],
  [0.71, 400],
  [0.93, 700],
  [1, 2200],
];

const r3 = (n: number) => Math.round(n * 1000) / 1000;

function TailDot({ head, stretch, k, done }: { head: MotionValue<number>; stretch: MotionValue<number>; k: number; done: MotionValue<number> }) {
  // Each tail dot trails the head by a share of the stretch, so faster means longer.
  const at = useTransform(() => head.get() - (k / TAIL) * stretch.get());
  const cx = useTransform(at, (a) => r3(C + Math.cos(a) * R));
  const cy = useTransform(at, (a) => r3(C + Math.sin(a) * R));
  const opacity = useTransform(done, (d) => (1 - d) * (1 - k / (TAIL + 1)) * 0.9);
  return <motion.circle cx={cx} cy={cy} r={r3(4.2 * (1 - k / (TAIL + 2)))} style={{ opacity }} />;
}

/**
 * A loader with a comet. The comet laps the ring, speeding up and easing off
 * each lap, and its tail stretches with the speed and shrinks as it slows.
 * Give it `progress` and the arc fills behind the comet; at 100% the ring
 * pops, turns green and draws a tick.
 */
export function OrbitalLoader({
  size = 112,
  progress,
  messages = MESSAGES,
  doneMessage = "Done",
  color,
  onComplete,
  autoplay = false,
  className = "",
}: OrbitalLoaderProps) {
  const reduce = useReducedMotion() === true;
  const [demo, setDemo] = useState<number | undefined>(autoplay ? 0 : undefined);
  const [demoOn, setDemoOn] = useState(autoplay);
  const value = demoOn ? demo : progress;
  const determinate = typeof value === "number";
  const target = determinate ? Math.max(0, Math.min(1, value)) : 0;
  const isDone = determinate && target >= 1;

  const fill = useSpring(target, { stiffness: 70, damping: 16 });
  const lap = useMotionValue(-Math.PI / 2);
  const head = useMotionValue(-Math.PI / 2);
  const stretch = useSpring(0.5, { stiffness: 180, damping: 22 });
  const done = useSpring(isDone ? 1 : 0, { stiffness: 260, damping: 18 });
  const pop = useMotionValue(1);
  const [line, setLine] = useState(0);
  const [pct, setPct] = useState(Math.round(target * 100));
  const completeRef = useRef(onComplete);
  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useMotionValueEvent(fill, "change", (v) => setPct(Math.round(Math.min(1, Math.max(0, v)) * 100)));

  useEffect(() => {
    fill.set(target);
  }, [fill, target]);

  const wasDone = useRef(isDone);
  useEffect(() => {
    done.set(isDone ? 1 : 0);
    if (isDone && !wasDone.current) {
      if (!reduce) animate(pop, [1.12, 1], { type: "spring", stiffness: 420, damping: 12 });
      completeRef.current?.();
    }
    wasDone.current = isDone;
  }, [isDone, done, pop, reduce]);

  // The comet: an uneven lap when indeterminate, riding the arc's end when determinate.
  const det = useRef(determinate);
  useEffect(() => {
    det.current = determinate;
  }, [determinate]);
  useEffect(() => {
    let raf = 0;
    let last = 0;
    let t = 0;
    let prev = head.get();
    const T = 1.7;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (!reduce) t += dt;
      const free = -Math.PI / 2 + 2 * Math.PI * (t / T) + 0.75 * Math.sin((2 * Math.PI * t) / T);
      lap.set(free);
      const h = det.current ? -Math.PI / 2 + fill.get() * 2 * Math.PI : free;
      const v = dt ? Math.abs(h - prev) / dt : 0;
      prev = h;
      head.set(h);
      stretch.set(Math.max(0.12, Math.min(1.6, v * 0.16)));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [head, lap, fill, stretch, reduce]);

  // Autoplay: a pretend upload that loops until someone clicks.
  useEffect(() => {
    if (!demoOn) return;
    let k = 0;
    let to = 0;
    const next = () => {
      const [p, hold] = DEMO[k % DEMO.length];
      setDemo(p);
      k++;
      to = window.setTimeout(() => {
        if (k % DEMO.length === 0) {
          setDemo(undefined);
          to = window.setTimeout(() => {
            setDemo(0);
            to = window.setTimeout(next, 600);
          }, 1800);
          return;
        }
        next();
      }, hold);
    };
    to = window.setTimeout(next, 900);
    return () => window.clearTimeout(to);
  }, [demoOn]);

  useEffect(() => {
    if (messages.length < 2 || isDone) return;
    const t = window.setInterval(() => setLine((n) => (n + 1) % messages.length), 1900);
    return () => window.clearInterval(t);
  }, [messages.length, isDone]);

  const arc = useTransform(fill, (v) => Math.max(0.001, Math.min(1, v)));
  const headX = useTransform(head, (a) => r3(C + Math.cos(a) * R));
  const headY = useTransform(head, (a) => r3(C + Math.sin(a) * R));
  const cometFade = useTransform(done, (d) => 1 - d);
  const tickLen = useTransform(done, [0.35, 1], [0, 1]);
  // A zero-length path with round caps still paints a dot, so hide the tick until it starts drawing.
  const tickShow = useTransform(done, (d) => (d > 0.36 ? 1 : 0));
  const ringRot = useTransform(lap, (a) => (a * 180) / Math.PI);
  const pctFade = useTransform(done, (d) => 1 - d);

  const accentCls = color ? "" : "stroke-[#0071e3] fill-[#0071e3] dark:stroke-[#0a84ff] dark:fill-[#0a84ff]";
  const accentStyle = color ? { stroke: color, fill: color } : undefined;
  const shown = isDone ? doneMessage : messages[line % Math.max(1, messages.length)];

  return (
    <div
      role="progressbar"
      aria-label="Loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={determinate ? Math.round(target * 100) : undefined}
      aria-valuetext={isDone ? doneMessage : determinate ? `${Math.round(target * 100)}%` : shown}
      className={`flex flex-col items-center gap-4 ${className}`}
      onPointerDown={() => {
        if (demoOn) setDemoOn(false);
      }}
    >
      <motion.div className="relative" style={{ width: size, height: size, scale: pop }}>
        <svg viewBox={`0 0 ${VB} ${VB}`} className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
          <motion.g style={{ rotate: ringRot, originX: "50%", originY: "50%" }} className="fill-none stroke-[#d2d2d7] dark:stroke-[#3a3a3c]">
            <circle cx={C} cy={C} r="33" strokeWidth="1" strokeDasharray="1.5 5" />
          </motion.g>
          <circle cx={C} cy={C} r={R} strokeWidth="6" className="fill-none stroke-[#f0f0f3] dark:stroke-[#2c2c2e]" />
          <motion.circle
            cx={C}
            cy={C}
            r={R}
            strokeWidth="6"
            strokeLinecap="round"
            transform={`rotate(-90 ${C} ${C})`}
            className={`fill-none ${accentCls}`}
            style={{ ...accentStyle, fill: "none", pathLength: arc }}
            initial={false}
            animate={{ opacity: determinate ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.circle
            cx={C}
            cy={C}
            r={R}
            strokeWidth="6"
            className="fill-none stroke-[#30d158]"
            initial={false}
            animate={{ opacity: isDone ? 1 : 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.g style={{ opacity: cometFade, ...accentStyle, stroke: "none" }} className={accentCls}>
            {Array.from({ length: TAIL }, (_, i) => (
              <TailDot key={i} head={head} stretch={stretch} k={i + 1} done={done} />
            ))}
            <motion.circle cx={headX} cy={headY} r="5" />
            <motion.circle cx={headX} cy={headY} r="9" style={{ opacity: 0.18 }} />
          </motion.g>
          <motion.path
            d="M43 61 L55 72 L78 47"
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-[#30d158]"
            style={{ pathLength: tickLen, opacity: tickShow }}
          />
        </svg>
        {determinate ? (
          <motion.span
            className="absolute inset-0 grid place-items-center text-[20px] font-semibold tabular-nums tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]"
            style={{ opacity: pctFade, fontSize: Math.max(12, Math.round(size * 0.17)) }}
            aria-hidden="true"
          >
            {pct}%
          </motion.span>
        ) : null}
      </motion.div>

      {messages.length || isDone ? (
        <div className="relative h-5 w-56 max-w-full overflow-hidden text-center" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={isDone ? "done" : line}
              initial={reduce ? false : { y: 14, opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { y: -14, opacity: 0, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className={`m-0 text-[13px] font-medium ${isDone ? "text-[#1a7f37] dark:text-[#30d158]" : "text-[#6e6e73] dark:text-[#a1a1a6]"}`}
            >
              {shown}
              {isDone ? "" : "…"}
            </motion.p>
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
}
