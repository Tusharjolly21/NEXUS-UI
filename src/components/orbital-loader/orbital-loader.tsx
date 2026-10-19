"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type OrbitalLoaderProps = {
  /** Diameter in px. */
  size?: number;
  /** 0–1 for a determinate ring; omit for an indeterminate sweep. */
  progress?: number;
  /** Status lines cycled under the loader. Pass one line for a fixed label, [] for none. */
  messages?: string[];
  /** Accent colour of the arc and orbiting dot. */
  color?: string;
  className?: string;
};

const MESSAGES = ["Warming up the build", "Fetching your components", "Compiling styles", "Almost there"];

/**
 * A loader with presence: counter-rotating orbits, a dot that circles the outer ring and an arc
 * that sweeps (or fills to `progress`), with status lines that change as you wait.
 */
export function OrbitalLoader({ size = 112, progress, messages = MESSAGES, color = "#6366f1", className }: OrbitalLoaderProps) {
  const reduce = useReducedMotion();
  const [i, setI] = React.useState(0);
  const r = 46;
  const c = 2 * Math.PI * r;
  const determinate = typeof progress === "number";

  React.useEffect(() => {
    if (messages.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), 1800);
    return () => clearInterval(t);
  }, [messages.length]);

  const spin = (duration: number, dir = 1) =>
    reduce ? {} : { animate: { rotate: 360 * dir }, transition: { duration, repeat: Infinity, ease: "linear" as const } };

  return (
    <div role="status" aria-live="polite" className={cn("flex flex-col items-center gap-5", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <div className="absolute inset-[22%] rounded-full blur-xl" style={{ background: color, opacity: 0.25 }} aria-hidden />
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
          <circle cx="50" cy="50" r={r} fill="none" strokeWidth="1.5" className="stroke-zinc-200 dark:stroke-white/10" />
          <circle cx="50" cy="50" r="34" fill="none" strokeWidth="1" strokeDasharray="2 5" className="stroke-zinc-300 dark:stroke-white/15" />
        </svg>

        <motion.svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90" aria-hidden {...(determinate ? {} : spin(1.6))}>
          <defs>
            <linearGradient id="orbital-loader-arc" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          </defs>
          <motion.circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            stroke={determinate ? color : "url(#orbital-loader-arc)"}
            strokeDasharray={c}
            initial={false}
            animate={{ strokeDashoffset: determinate ? c * (1 - Math.min(1, Math.max(0, progress))) : c * 0.7 }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
          />
        </motion.svg>

        <motion.div className="absolute inset-[16%]" aria-hidden {...spin(5, -1)}>
          <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-950 dark:bg-white" />
        </motion.div>
        <motion.div className="absolute inset-0" aria-hidden {...spin(3.2)}>
          <span className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
        </motion.div>

        <div className="absolute inset-0 grid place-items-center">
          {determinate ? (
            <span className="text-[15px] font-semibold tabular-nums text-zinc-950 dark:text-white">{Math.round(progress * 100)}%</span>
          ) : (
            <motion.span
              className="size-3 rounded-full bg-zinc-950 dark:bg-white"
              animate={reduce ? undefined : { scale: [1, 1.35, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>
      </div>

      {messages.length ? (
        <div className="relative h-5 w-56 overflow-hidden text-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={i}
              initial={reduce ? false : { y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? undefined : { y: -12, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400"
            >
              {messages[i]}…
            </motion.p>
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
}
