Add the "Animated Countdown" component from Nexus UI to my project.

Flip-style countdown timer with four variants — modern, digital, minimal, and classic. Smooth number transitions powered by Framer Motion. Also includes the Motion Kit Split-Flap Board variant. Also includes Watch Countdown, where days, hours, minutes and seconds empty around four concentric rings with glowing heads and rolling digits. Also includes Fuse Countdown, where a spark burns along a rope fuse at the pace of the clock and sets off a rocket and fireworks at zero.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { AnimatedCountdown } from "@/components/animated-countdown/animated-countdown";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/animated-countdown/animated-countdown.tsx ---

```tsx
"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type CountdownUnitKey = "days" | "hours" | "minutes" | "seconds";
type CountdownVariant = "modern" | "digital" | "minimal" | "classic";
type CountdownSize = "sm" | "md" | "lg";

type TimeLeft = Record<CountdownUnitKey, number>;

export type AnimatedCountdownProps = {
  targetDate?: Date | string | number;
  variant?: CountdownVariant;
  showDays?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
  unitOrder?: CountdownUnitKey[];
  backgroundColor?: string;
  accentColor?: string;
  className?: string;
  containerClassName?: string;
  unitClassName?: string;
  accentClassName?: string;
  labelClassName?: string;
  numberClassName?: string;
  separator?: React.ReactNode;
  showSeparators?: boolean;
  completionMessage?: string;
  onComplete?: () => void;
  staticMode?: boolean;
  initialStaticTime?: Partial<TimeLeft>;
  compact?: boolean;
  size?: CountdownSize;
  ariaLabel?: string;
};

const DEFAULT_STATIC_TIME: TimeLeft = {
  days: 7,
  hours: 12,
  minutes: 45,
  seconds: 30,
};

const UNIT_LABELS: Record<CountdownUnitKey, string> = {
  days: "Days",
  hours: "Hours",
  minutes: "Minutes",
  seconds: "Seconds",
};

const variantClasses: Record<CountdownVariant, string> = {
  modern:
    "border-border/70 bg-background/75 shadow-2xl shadow-primary/5 backdrop-blur-xl dark:bg-white/[0.035]",
  digital:
    "border-cyan-400/20 bg-zinc-950 text-white shadow-2xl shadow-cyan-500/10",
  minimal: "border-transparent bg-transparent shadow-none",
  classic: "border-border bg-card shadow-sm dark:bg-zinc-900/80",
};

const unitVariantClasses: Record<CountdownVariant, string> = {
  modern:
    "border-border/70 bg-muted/45 shadow-sm transition hover:border-primary/35 hover:bg-muted/65 hover:shadow-primary/10 dark:bg-white/[0.04]",
  digital:
    "border-cyan-400/20 bg-cyan-400/[0.055] font-mono shadow-[0_0_28px_-18px_rgba(34,211,238,0.9)] transition hover:border-cyan-300/40 hover:bg-cyan-400/[0.09]",
  minimal: "border-transparent bg-transparent transition hover:bg-muted/35",
  classic:
    "border-border bg-background shadow-sm transition hover:border-primary/30 hover:bg-muted/35 dark:bg-white/[0.035]",
};

const sizeClasses: Record<CountdownSize, { container: string; unit: string; number: string; label: string }> = {
  sm: {
    container: "gap-2 p-2",
    unit: "min-w-[4.25rem] rounded-xl px-3 py-3",
    number: "text-2xl",
    label: "text-[10px]",
  },
  md: {
    container: "gap-2.5 p-2.5 sm:gap-3 sm:p-3",
    unit: "min-w-[4.8rem] rounded-2xl px-3.5 py-4 sm:min-w-[5.6rem] sm:px-4",
    number: "text-3xl sm:text-4xl",
    label: "text-[10px] sm:text-[11px]",
  },
  lg: {
    container: "gap-3 p-3 sm:gap-4 sm:p-4",
    unit: "min-w-[5.2rem] rounded-2xl px-4 py-4 sm:min-w-[6.5rem] sm:px-5 sm:py-5",
    number: "text-4xl sm:text-5xl",
    label: "text-[11px] sm:text-xs",
  },
};

function toDateTime(value: AnimatedCountdownProps["targetDate"]) {
  if (!value) return null;
  const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

function getTimeLeft(targetDate?: AnimatedCountdownProps["targetDate"]): TimeLeft {
  const target = toDateTime(targetDate);
  if (!target) return DEFAULT_STATIC_TIME;

  const total = Math.max(0, target - Date.now());
  const secondsTotal = Math.floor(total / 1000);
  const days = Math.floor(secondsTotal / 86400);
  const hours = Math.floor((secondsTotal % 86400) / 3600);
  const minutes = Math.floor((secondsTotal % 3600) / 60);
  const seconds = secondsTotal % 60;

  return { days, hours, minutes, seconds };
}

function isFinished(time: TimeLeft) {
  return time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0;
}

function format(value: number) {
  return String(Math.max(0, value)).padStart(2, "0");
}

function useVisibleUnits({
  showDays,
  showHours,
  showMinutes,
  showSeconds,
  unitOrder,
}: Required<Pick<AnimatedCountdownProps, "showDays" | "showHours" | "showMinutes" | "showSeconds" | "unitOrder">>) {
  return React.useMemo(() => {
    const enabled = {
      days: showDays,
      hours: showHours,
      minutes: showMinutes,
      seconds: showSeconds,
    };
    return unitOrder.filter((unit) => enabled[unit]);
  }, [showDays, showHours, showMinutes, showSeconds, unitOrder]);
}

function CountdownNumber({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion() === true;

  return (
    <span className={cn("relative inline-grid min-w-[2ch] place-items-center tabular-nums", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={reduceMotion ? false : { y: 12, opacity: 0, filter: "blur(4px)" }}
          animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={reduceMotion ? { opacity: 0 } : { y: -12, opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: reduceMotion ? 0.05 : 0.25, ease: "easeOut" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function CountdownUnit({
  unit,
  value,
  variant,
  size,
  unitClassName,
  numberClassName,
  labelClassName,
  accentClassName,
  index,
}: {
  unit: CountdownUnitKey;
  value: number;
  variant: CountdownVariant;
  size: CountdownSize;
  unitClassName?: string;
  numberClassName?: string;
  labelClassName?: string;
  accentClassName?: string;
  index: number;
}) {
  const reduceMotion = useReducedMotion() === true;
  const sizePreset = sizeClasses[size];

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.055, duration: 0.35, ease: "easeOut" }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden border text-center",
        unitVariantClasses[variant],
        sizePreset.unit,
        unitClassName,
      )}
    >
      {variant === "modern" && (
        <span
          className={cn(
            "pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent",
            accentClassName,
          )}
        />
      )}
      <CountdownNumber
        value={format(value)}
        className={cn(
          "font-bold leading-none tracking-tight text-foreground",
          variant === "digital" && "font-mono text-cyan-100 drop-shadow-[0_0_18px_rgba(34,211,238,0.45)]",
          variant === "minimal" && "font-semibold",
          sizePreset.number,
          numberClassName,
        )}
      />
      <span
        className={cn(
          "mt-2 font-semibold uppercase tracking-[0.18em] text-muted-foreground",
          variant === "digital" && "text-cyan-200/55",
          sizePreset.label,
          labelClassName,
        )}
      >
        {UNIT_LABELS[unit]}
      </span>
    </motion.div>
  );
}

export function AnimatedCountdown({
  targetDate,
  variant = "modern",
  showDays = true,
  showHours = true,
  showMinutes = true,
  showSeconds = true,
  unitOrder = ["days", "hours", "minutes", "seconds"],
  backgroundColor,
  accentColor,
  className,
  containerClassName,
  unitClassName,
  accentClassName,
  labelClassName,
  numberClassName,
  separator = ":",
  showSeparators = variant === "digital",
  completionMessage = "We're live!",
  onComplete,
  staticMode,
  initialStaticTime,
  compact = false,
  size = compact ? "sm" : "md",
  ariaLabel = "Countdown timer",
}: AnimatedCountdownProps) {
  const reduceMotion = useReducedMotion() === true;
  const isStatic = staticMode ?? !targetDate;
  const completedRef = React.useRef(false);
  const staticTime = React.useMemo<TimeLeft>(
    () => ({ ...DEFAULT_STATIC_TIME, ...initialStaticTime }),
    [initialStaticTime],
  );
  const [timeLeft, setTimeLeft] = React.useState<TimeLeft>(DEFAULT_STATIC_TIME);
  const [mounted, setMounted] = React.useState(false);
  const visibleUnits = useVisibleUnits({ showDays, showHours, showMinutes, showSeconds, unitOrder });
  const sizePreset = sizeClasses[size];
  const displayTimeLeft = isStatic ? staticTime : timeLeft;
  const completed = mounted && !isStatic && isFinished(displayTimeLeft);

  React.useEffect(() => {
    setMounted(true);
    if (isStatic) return;

    setTimeLeft(getTimeLeft(targetDate));
    const interval = window.setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isStatic, targetDate]);

  React.useEffect(() => {
    if (!completed || completedRef.current) return;
    completedRef.current = true;
    onComplete?.();
  }, [completed, onComplete]);

  const style = {
    ...(backgroundColor ? { backgroundColor } : null),
    ...(accentColor ? { "--countdown-accent": accentColor } as React.CSSProperties : null),
  } as React.CSSProperties;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex max-w-full flex-col items-center rounded-[1.75rem] border",
        variantClasses[variant],
        sizePreset.container,
        compact && "rounded-2xl",
        containerClassName,
        className,
      )}
      style={style}
    >
      <div
        className={cn(
          "grid max-w-full grid-cols-2 items-stretch gap-2 sm:flex sm:flex-wrap sm:justify-center",
          showSeparators && "sm:gap-0",
        )}
      >
        {visibleUnits.map((unit, index) => (
          <React.Fragment key={unit}>
            <CountdownUnit
              unit={unit}
              value={displayTimeLeft[unit]}
              variant={variant}
              size={size}
              unitClassName={unitClassName}
              numberClassName={numberClassName}
              labelClassName={labelClassName}
              accentClassName={accentClassName}
              index={index}
            />
            {showSeparators && index < visibleUnits.length - 1 && (
              <span
                className={cn(
                  "hidden items-center px-2 text-2xl font-semibold text-muted-foreground/50 sm:flex",
                  variant === "digital" && "font-mono text-cyan-200/45",
                )}
                aria-hidden
              >
                {separator}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence>
        {completed && completionMessage && (
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="mt-3 text-sm font-medium text-primary"
          >
            {completionMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

# Split-Flap Board

Add the "Split-Flap Board" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { SplitFlapBoard } from "@/components/animated-countdown/split-flap-board";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/animated-countdown/split-flap-board.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface SplitFlapBoardProps {
  /** Moment to count down to, as a Date or epoch milliseconds. Defaults to 2 days 14:37:09 after the board mounts. */
  to?: Date | number;
  /** Heading in the top-left corner. */
  label?: string;
  /** Text next to the pulsing dot in the top-right corner. */
  liveLabel?: string;
  /** Caption above the status row. */
  statusLabel?: string;
  /** Status lines. The first is shown; with `autoplay` the board rotates through them. Up to 10 characters fit. */
  statuses?: string[];
  /** Shows this status instead of the `statuses` list (controlled). */
  status?: string;
  /** Called once when the countdown reaches zero. */
  onComplete?: () => void;
  /** Rotates the status line every 4.2s until someone presses the board. The countdown always runs. */
  autoplay?: boolean;
  /** Extra classes for the board. */
  className?: string;
}

const CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:";
const DIGITS = " 0123456789";
const DEFAULT_STATUSES = ["BOARDING", "ON TIME", "GATE B12", "FINAL CALL"];
/** 2 days, 14 hours, 37 minutes, 9 seconds. */
const DEFAULT_OFFSET = ((2 * 24 + 14) * 3600 + 37 * 60 + 9) * 1000;
const FONT = "ui-monospace, 'SF Mono', Menlo, monospace";

// A shared one-second clock. The server snapshot is null so the first client render matches the HTML.
const subscribe = (cb: () => void) => {
  const t = setInterval(cb, 250);
  return () => clearInterval(t);
};
const getSecond = () => Math.floor(Date.now() / 1000);
const getServerSecond = () => null;

/** One half of a tile. Sizes come from the board's `--fw`, `--fh` and `--ffs` variables. */
function Half({ ch, top }: { ch: string; top: boolean }) {
  return (
    <span
      className="absolute left-0 w-full overflow-hidden"
      style={{
        height: "calc(var(--fh) / 2)",
        top: top ? 0 : "calc(var(--fh) / 2)",
        background: top ? "linear-gradient(#2c2c2e,#232325)" : "linear-gradient(#202022,#29292b)",
        borderRadius: top ? "5px 5px 0 0" : "0 0 5px 5px",
      }}
    >
      <span
        className="absolute left-0 flex w-full items-center justify-center font-semibold text-[#f5f5f7]"
        style={{ height: "var(--fh)", top: top ? 0 : "calc(var(--fh) / -2)", fontSize: "var(--ffs)", fontFamily: FONT }}
      >
        {ch}
      </span>
    </span>
  );
}

/** One flap. It steps through its character set until it reaches its target, like a real board. */
function Flap({ target, speed = 55, set = CHARS, instant }: { target: string; speed?: number; set?: string; instant: boolean }) {
  const [st, setSt] = useState({ cur: " ", old: " ", n: 0 });
  useEffect(() => {
    if (st.cur === target) return;
    const t = setTimeout(() => {
      setSt((s) => {
        const i = set.indexOf(s.cur);
        // Characters outside the set (and reduced motion) land in one flip instead of looping forever.
        const next = instant || !set.includes(target) ? target : set[(i + 1) % set.length];
        return { cur: next, old: s.cur, n: s.n + 1 };
      });
    }, speed);
    return () => clearTimeout(t);
  }, [st.cur, target, speed, set, instant]);
  const d = speed / 1000;
  return (
    <span className="relative inline-block flex-none" style={{ width: "var(--fw)", height: "var(--fh)", perspective: 200 }} aria-hidden="true">
      <Half ch={st.cur} top />
      <Half ch={st.old} top={false} />
      <motion.span
        key={`t${st.n}`}
        className="absolute left-0 top-0 w-full"
        style={{ height: "calc(var(--fh) / 2)", transformOrigin: "50% 100%", backfaceVisibility: "hidden" }}
        initial={{ rotateX: 0 }}
        animate={{ rotateX: -90 }}
        transition={{ duration: d * 0.9, ease: "easeIn" }}
      >
        <Half ch={st.old} top />
      </motion.span>
      <motion.span
        key={`b${st.n}`}
        className="absolute left-0 w-full"
        style={{ top: "calc(var(--fh) / 2)", height: "calc(var(--fh) / 2)", transformOrigin: "50% 0%", backfaceVisibility: "hidden" }}
        initial={{ rotateX: 90 }}
        animate={{ rotateX: 0 }}
        transition={{ duration: d * 0.9, delay: d * 0.45, ease: "easeOut" }}
      >
        <span className="absolute left-0 w-full" style={{ top: "calc(var(--fh) / -2)", height: "var(--fh)" }}>
          <Half ch={st.cur} top={false} />
        </span>
      </motion.span>
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-px bg-black/70" />
    </span>
  );
}

function Row({ text, len, speed, set, instant }: { text: string; len: number; speed?: number; set?: string; instant: boolean }) {
  const t = text.toUpperCase().padEnd(len, " ").slice(0, len);
  return (
    <span className="flex gap-[3px]" aria-hidden="true">
      {t.split("").map((c, i) => (
        <Flap key={i} target={c} speed={speed} set={set} instant={instant} />
      ))}
    </span>
  );
}

const p2 = (v: number) => String(v).padStart(2, "0");

/**
 * A split-flap board, the kind that used to clatter in stations. Each tile
 * flips through the alphabet until it lands on its letter, so changes ripple
 * across the row. Shown as a launch countdown with a rotating status line.
 */
export function SplitFlapBoard({
  to,
  label = "Launch · MK 4.0",
  liveLabel = "Live",
  statusLabel = "Status",
  statuses = DEFAULT_STATUSES,
  status,
  onComplete,
  autoplay = false,
  className = "",
}: SplitFlapBoardProps) {
  const reduce = useReducedMotion() ?? false;
  const [fallbackTarget] = useState(() => Date.now() + DEFAULT_OFFSET);
  const target = to === undefined ? fallbackTarget : typeof to === "number" ? to : to.getTime();
  const nowSec = useSyncExternalStore(subscribe, getSecond, getServerSecond);
  const [s, setS] = useState(0);
  const touched = useRef(false);
  const done = useRef(false);

  useEffect(() => {
    if (!autoplay || statuses.length < 2) return;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      setS((k) => k + 1);
    }, 4200);
    return () => clearInterval(t);
  }, [autoplay, statuses.length]);

  const left = nowSec === null ? null : Math.max(0, Math.floor(target / 1000) - nowSec);

  useEffect(() => {
    if (left === null) return;
    if (left > 0) {
      done.current = false;
      return;
    }
    if (done.current) return;
    done.current = true;
    onComplete?.();
  }, [left, onComplete]);

  const dd = left === null ? null : Math.floor(left / 86400);
  const hh = left === null ? null : Math.floor((left % 86400) / 3600);
  const mm = left === null ? null : Math.floor((left % 3600) / 60);
  const ss = left === null ? null : left % 60;
  const fmt = (v: number | null) => (v === null ? "  " : p2(v));
  const line = status ?? (statuses.length ? statuses[s % statuses.length] : "");

  return (
    <div
      className={`flex flex-col gap-4 rounded-[24px] bg-[#111113] p-5 shadow-[0_24px_48px_-26px_rgba(0,0,0,.6)] [--ffs:24px] [--fh:40px] [--fw:26px] max-[400px]:p-4 max-[400px]:[--ffs:20px] max-[400px]:[--fh:34px] max-[400px]:[--fw:21px] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_48px_-26px_rgba(0,0,0,.9)] ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8e8e93]">
        <span className="truncate">{label}</span>
        <span className="flex flex-none items-center gap-1.5">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-[#30d158]"
            animate={reduce ? { opacity: 1 } : { opacity: [1, 0.3, 1] }}
            transition={reduce ? { duration: 0 } : { duration: 1.2, repeat: Infinity }}
          />
          {liveLabel}
        </span>
      </div>
      <div
        role="timer"
        aria-label={left === null ? "Countdown" : `${dd} days ${hh} hours ${mm} minutes ${ss} seconds remaining`}
        className="flex items-end gap-2"
      >
        {(
          [
            [fmt(dd), "Days"],
            [fmt(hh), "Hrs"],
            [fmt(mm), "Min"],
            [fmt(ss), "Sec"],
          ] as const
        ).map(([v, l], i) => (
          <div key={l} className="flex items-end gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <Row text={v} len={Math.max(2, v.length)} speed={60} set={DIGITS} instant={reduce} />
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#636366]" aria-hidden="true">
                {l}
              </span>
            </div>
            {i < 3 && (
              <span className="mb-[26px] text-[20px] font-semibold text-[#48484a]" aria-hidden="true">
                :
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8e8e93]">{statusLabel}</span>
        <span className="sr-only" aria-live="polite">
          {line}
        </span>
        <Row text={line} len={10} speed={40} instant={reduce} />
      </div>
    </div>
  );
}
```

# Watch Countdown

Add the "Watch Countdown" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { WatchCountdown } from "@/components/animated-countdown/watch-countdown";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/animated-countdown/watch-countdown.tsx ---

```tsx
"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

export interface WatchCountdownProps {
  /** Moment to count down to, as a Date or epoch milliseconds. Defaults to 12 days 7:43:21 after the clock first starts on the client. */
  to?: Date | number;
  /** Small caption above the rings. */
  title?: string;
  /** Extra classes for the card. */
  className?: string;
}

const RINGS = [
  { key: "d", label: "Days", color: "#bf5af2", max: 30 },
  { key: "h", label: "Hours", color: "#5e5ce6", max: 24 },
  { key: "m", label: "Minutes", color: "#0a84ff", max: 60 },
  { key: "s", label: "Seconds", color: "#64d2ff", max: 60 },
] as const;

const SIZE = 300;
const C = SIZE / 2;
const STROKE = 16;
const GAP = 5;
/** 12 days, 7 hours, 43 minutes, 21 seconds. */
const DEFAULT_OFFSET = (((12 * 24 + 7) * 60 + 43) * 60 + 21) * 1000;

// A shared clock. The server snapshot is null so the first client render matches the HTML.
// `latest` is cached between ticks so getSnapshot stays stable for React.
let latest = 0;
let subscribers = 0;

function attach() {
  subscribers += 1;
  latest = Date.now();
  return () => {
    subscribers -= 1;
    if (subscribers === 0) latest = 0;
  };
}

/** Smooth clock: one update per animation frame (paused by the browser while the tab is hidden). */
function subscribeFrames(cb: () => void) {
  const detach = attach();
  let raf = 0;
  const loop = () => {
    latest = Date.now();
    cb();
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(raf);
    detach();
  };
}

/** Coarse clock: four checks a second, used off screen and under reduced motion. */
function subscribeCoarse(cb: () => void) {
  const detach = attach();
  const t = setInterval(() => {
    if (document.hidden) return;
    latest = Date.now();
    cb();
  }, 250);
  return () => {
    clearInterval(t);
    detach();
  };
}

const getNow = (): number | null => {
  if (latest === 0) latest = Date.now();
  return latest;
};
const getServerNow = (): number | null => null;

const two = (n: number) => String(n).padStart(2, "0");

function Digit({ v, reduce }: { v: string; reduce: boolean }) {
  return (
    <span className="relative inline-flex h-[1.15em] w-[0.62em] justify-center overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={v}
          className="absolute"
          initial={reduce ? false : { y: "100%", opacity: 0, filter: "blur(4px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { y: "-100%", opacity: 0, filter: "blur(4px)" }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32, filter: { duration: 0.2 } }}
        >
          {v}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * A countdown drawn as watch rings: days, hours, minutes and seconds each
 * empty around their own track, the seconds ring sweeping smoothly with a
 * bright head on its tip. The time in the middle rolls digit by digit, and
 * pointing at a ring (or focusing its readout underneath) names it.
 */
export function WatchCountdown({ to, title = "Nexus 3.0 ships in", className = "" }: WatchCountdownProps) {
  const reduce = useReducedMotion() ?? false;
  const uid = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const onScreen = useInView(root, { amount: 0.1 });
  const now = useSyncExternalStore(reduce || !onScreen ? subscribeCoarse : subscribeFrames, getNow, getServerNow);
  const [hover, setHover] = useState<number | null>(null);

  // Without an explicit target, the default is fixed from the first real clock reading, never during the server render.
  const explicit = to === undefined ? null : typeof to === "number" ? to : to.getTime();
  const [fallback, setFallback] = useState<number | null>(null);
  if (explicit === null && fallback === null && now !== null) setFallback(now + DEFAULT_OFFSET);
  const end = explicit ?? fallback;

  const ready = now !== null && end !== null;
  const left = ready ? Math.max(0, end - (reduce ? Math.floor(now / 1000) * 1000 : now)) : 0;
  const parts = {
    d: left / 86400000,
    h: (left % 86400000) / 3600000,
    m: (left % 3600000) / 60000,
    s: (left % 60000) / 1000,
  };
  const whole = { d: Math.floor(parts.d), h: Math.floor(parts.h), m: Math.floor(parts.m), s: Math.floor(parts.s) };
  const show = (key: (typeof RINGS)[number]["key"]) => (!ready ? "--" : key === "d" ? String(whole.d) : two(whole[key]));
  const big = hover === null ? `${show("d")}d` : show(RINGS[hover].key);

  return (
    <div
      ref={root}
      className={`flex w-[360px] max-w-full flex-col items-center rounded-[30px] bg-[#0b0b0d] px-6 pb-7 pt-6 text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,.6)] max-[400px]:px-4 dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_30px_60px_-30px_rgba(0,0,0,.9)] ${className}`}
    >
      <span className="text-[13px] font-medium uppercase tracking-[0.16em] text-white/50">{title}</span>
      <div className="relative mt-4" style={{ width: SIZE, height: SIZE, maxWidth: "100%" }}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full -rotate-90" aria-hidden="true">
          <defs>
            <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          {RINGS.map((r, i) => {
            const radius = C - STROKE / 2 - i * (STROKE + GAP);
            const circ = 2 * Math.PI * radius;
            const frac = Math.min(1, parts[r.key] / r.max);
            const a = frac * Math.PI * 2;
            const hx = C + Math.cos(a) * radius;
            const hy = C + Math.sin(a) * radius;
            const dim = hover !== null && hover !== i;
            return (
              <g
                key={r.key}
                style={{ opacity: dim ? 0.35 : 1, transition: reduce ? "none" : "opacity .2s" }}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
              >
                <circle cx={C} cy={C} r={radius} fill="none" stroke={r.color} strokeOpacity=".18" strokeWidth={STROKE} />
                <circle cx={C} cy={C} r={radius} fill="none" stroke={r.color} strokeWidth={STROKE} strokeLinecap="round" strokeDasharray={`${frac * circ} ${circ}`} />
                {frac > 0.01 && (
                  <>
                    <circle cx={hx} cy={hy} r={STROKE / 2 + 2} fill={r.color} filter={`url(#${uid}-glow)`} opacity=".9" />
                    <circle cx={hx} cy={hy} r={STROKE / 2 - 1} fill="#fff" opacity=".9" />
                  </>
                )}
                {/* invisible fat hit area so the ring is easy to point at */}
                <circle cx={C} cy={C} r={radius} fill="none" stroke="transparent" strokeWidth={STROKE + GAP} />
              </g>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={hover ?? "all"}
              className="text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: hover === null ? "rgba(255,255,255,.5)" : RINGS[hover].color }}
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -4 }}
              transition={reduce ? { duration: 0 } : undefined}
            >
              {hover === null ? "Remaining" : RINGS[hover].label}
            </motion.span>
          </AnimatePresence>
          <span className="mt-1 flex text-[34px] font-semibold leading-[1.15] tabular-nums tracking-[-0.03em] text-white" aria-hidden="true">
            {[...big].map((c, k) => (
              <Digit key={`${hover ?? "all"}-${k}`} v={c} reduce={reduce} />
            ))}
          </span>
          <span className="mt-1 text-[15px] font-medium tabular-nums text-white/70" aria-hidden="true">
            {ready ? `${two(whole.h)}:${two(whole.m)}:${two(whole.s)}` : "--:--:--"}
          </span>
        </div>
      </div>
      <div className="mt-4 grid w-full grid-cols-4 gap-2">
        {RINGS.map((r, i) => (
          <button
            key={r.key}
            type="button"
            aria-label={ready ? `${show(r.key)} ${r.label.toLowerCase()}` : r.label}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            className="flex flex-col items-center rounded-[12px] py-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a84ff]"
          >
            <span className="text-[17px] font-semibold tabular-nums" style={{ color: r.color }}>
              {show(r.key)}
            </span>
            <span className="text-[10px] uppercase tracking-[0.12em] text-white/45">{r.label}</span>
          </button>
        ))}
      </div>
      <span className="sr-only" role="timer" aria-live="polite">
        {ready ? `${whole.d} days ${whole.h} hours ${whole.m} minutes left` : "Countdown"}
      </span>
    </div>
  );
}
```

# Fuse Countdown

Add the "Fuse Countdown" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { FuseCountdown } from "@/components/animated-countdown/fuse-countdown";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/animated-countdown/fuse-countdown.tsx ---

```tsx
"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export interface FuseCountdownProps {
  /** How long the fuse burns, in seconds. */
  seconds?: number;
  /** Caption shown while the fuse burns. */
  title?: string;
  /** Message shown once the rocket has gone up. */
  launchMessage?: string;
  /** Called once each time the fuse reaches the rocket. */
  onLaunch?: () => void;
  /** After each launch, relights the fuse by itself until someone presses the button. */
  autoplay?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

const VW = 380;
const VH = 230;
const FUSE = "M 22 168 C 70 168, 60 96, 112 104 S 160 196, 214 170 S 262 110, 300 182";
const START = { x: 22, y: 168 };
const ROCKET_X = 318;
const ROCKET_BASE = 186;
const SPARK_POOL = 192;
const BURST_COUNT = 90;
const BURST_COLORS = ["#ff375f", "#ffd60a", "#30d158", "#0a84ff", "#bf5af2"];

type Spark = { x: number; y: number; vx: number; vy: number; life: number; c: string };

/** Moves a pool of pre-rendered circles to match the live particles, hiding the rest. */
function drawPool(pool: (SVGCircleElement | null)[], list: Spark[], radius: number) {
  for (let i = 0; i < pool.length; i++) {
    const el = pool[i];
    if (!el) continue;
    const s = list[i];
    if (!s || s.life <= 0) {
      if (el.getAttribute("r") !== "0") el.setAttribute("r", "0");
      continue;
    }
    const k = Math.min(1, s.life * 2);
    el.setAttribute("cx", s.x.toFixed(1));
    el.setAttribute("cy", s.y.toFixed(1));
    el.setAttribute("r", (radius * k).toFixed(2));
    el.setAttribute("fill", s.c);
    el.setAttribute("opacity", k.toFixed(2));
  }
}

/**
 * A launch countdown on a lit fuse. The spark eats along a curling fuse at
 * exactly the pace of the clock, spitting sparks and leaving ash behind it.
 * When it reaches the rocket, the rocket goes up and bursts into the
 * announcement. Relight lights a fresh fuse. The fuse lights when the card
 * scrolls into view and holds while it is off screen or the tab is hidden.
 */
export function FuseCountdown({
  seconds = 24,
  title = "Doors open in",
  launchMessage = "Nexus 3.0 is out. Go look.",
  onLaunch,
  autoplay = false,
  className = "",
}: FuseCountdownProps) {
  const reduce = useReducedMotion() ?? false;
  const uid = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const sparkEls = useRef<(SVGCircleElement | null)[]>([]);
  const burstEls = useRef<(SVGCircleElement | null)[]>([]);
  const touched = useRef(false);
  const launchCb = useRef(onLaunch);
  const [left, setLeft] = useState(seconds);
  const [launched, setLaunched] = useState(false);
  const [run, setRun] = useState(0);
  const [burnt, setBurnt] = useState(0);
  const [tip, setTip] = useState(START);
  const [len, setLen] = useState(1);

  useEffect(() => {
    launchCb.current = onLaunch;
  }, [onLaunch]);

  const relight = useCallback(() => {
    setLaunched(false);
    setBurnt(0);
    setTip(START);
    setLeft(seconds);
    setRun((r) => r + 1);
  }, [seconds]);

  useEffect(() => {
    const p = path.current;
    const box = root.current;
    if (!p || !box) return;
    const L = p.getTotalLength();
    const sparks: Spark[] = [];
    const burst: Spark[] = [];
    const sparkPool = sparkEls.current;
    const burstPool = burstEls.current;
    let raf = 0;
    let prev = 0;
    let elapsed = 0;
    let sinceLaunch = 0;
    let spawn = 0;
    let done = false;
    let burstFired = false;
    let finished = false;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      // Time only advances while the card is drawing frames, so the fuse holds off screen and in hidden tabs.
      const dt = prev ? Math.min(0.05, (now - prev) / 1000) : 0;
      prev = now;
      elapsed = Math.min(seconds, elapsed + dt);
      const t = seconds > 0 ? elapsed / seconds : 1;
      // Reduced motion: the fuse steps once a second instead of creeping.
      const shown = reduce ? Math.min(seconds, Math.ceil(elapsed)) : elapsed;
      const b = (seconds > 0 ? shown / seconds : 1) * L;
      const pt = p.getPointAtLength(b);
      setLen(L);
      setBurnt(b);
      setTip({ x: pt.x, y: pt.y });
      setLeft(Math.max(0, seconds - shown));

      if (!reduce && t < 1) {
        spawn += dt * 180;
        while (spawn >= 1 && sparks.length < SPARK_POOL) {
          spawn -= 1;
          const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6;
          const s = 40 + Math.random() * 110;
          sparks.push({ x: pt.x, y: pt.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.35 + Math.random() * 0.4, c: Math.random() > 0.4 ? "#ffd60a" : "#ff9f0a" });
        }
        spawn = Math.min(spawn, 1);
      }
      if (t >= 1 && !done) {
        done = true;
        setLaunched(true);
        launchCb.current?.();
      }
      if (done) sinceLaunch += dt;
      if (done && !reduce && !burstFired && sinceLaunch >= 0.65) {
        burstFired = true;
        for (let k = 0; k < BURST_COUNT; k++) {
          const a = (k / BURST_COUNT) * Math.PI * 2;
          const s = 70 + Math.random() * 90;
          burst.push({ x: ROCKET_X, y: 46, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1 + Math.random() * 0.6, c: BURST_COLORS[k % BURST_COLORS.length] });
        }
      }
      for (const arr of [sparks, burst]) {
        for (const s of arr) {
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.vy += 160 * dt;
          s.vx *= 0.98;
          s.life -= dt;
        }
        let i = arr.length;
        while (i--) if (arr[i].life <= 0) arr.splice(i, 1);
      }
      drawPool(sparkPool, sparks, 1.6);
      drawPool(burstPool, burst, 2.6);

      // Nothing left to animate: stop the loop until the next relight.
      if (done && sparks.length === 0 && burst.length === 0 && (burstFired || reduce)) {
        finished = true;
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const start = () => {
      if (raf || finished) return;
      prev = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    for (const el of [...sparkPool, ...burstPool]) el?.setAttribute("r", "0");

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0.2 },
    );
    io.observe(box);
    return () => {
      io.disconnect();
      stop();
    };
  }, [seconds, run, reduce]);

  // Autoplay: after a launch, hold for a moment, then light a fresh fuse. Stops for good once the button is pressed.
  useEffect(() => {
    if (!autoplay || reduce || !launched) return;
    const t = setTimeout(() => {
      if (!touched.current) relight();
    }, 4200);
    return () => clearTimeout(t);
  }, [autoplay, reduce, launched, relight]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(Math.floor(left % 60)).padStart(2, "0");
  const cs = String(Math.floor((left % 1) * 100)).padStart(2, "0");

  return (
    <div
      ref={root}
      onPointerDown={() => {
        touched.current = true;
      }}
      className={`w-[400px] max-w-full overflow-hidden rounded-[28px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] ${className}`}
    >
      <div className="flex items-baseline justify-between gap-3 px-6 pt-6 max-[400px]:px-4 max-[400px]:pt-4">
        <span className="text-[14px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{launched ? "We're live" : title}</span>
        <span className="text-[30px] font-semibold tabular-nums tracking-[-0.03em]" aria-hidden="true">
          {mm}:{ss}
          <span className="text-[18px] text-[#6e6e73] dark:text-[#a1a1a6]">.{cs}</span>
        </span>
      </div>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="block h-auto w-full"
        aria-label={launched ? "The rocket has launched" : `${Math.ceil(left)} seconds left on the fuse`}
        role="img"
      >
        <defs>
          <pattern id={`${uid}-rope`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#c9a36b" />
            <rect width="3" height="6" fill="#b38a52" />
          </pattern>
          <linearGradient id={`${uid}-body`} x1="0" x2="1">
            <stop offset="0" stopColor="#d2d2d7" />
            <stop offset=".38" stopColor="#ffffff" />
            <stop offset="1" stopColor="#c7c7cc" />
          </linearGradient>
          <radialGradient id={`${uid}-glow`}>
            <stop offset="0" stopColor="#fff7d1" />
            <stop offset=".4" stopColor="#ffd60a" stopOpacity=".9" />
            <stop offset="1" stopColor="#ff9f0a" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* ash behind the spark, rope ahead of it */}
        <path d={FUSE} fill="none" stroke="#8e8e93" strokeOpacity=".45" strokeWidth="2" strokeDasharray={`${burnt} ${len}`} strokeLinecap="round" />
        <path ref={path} d={FUSE} fill="none" stroke={`url(#${uid}-rope)`} strokeWidth="5" strokeLinecap="round" strokeDasharray={`0 ${burnt} ${len}`} />
        {!launched && <circle cx={tip.x} cy={tip.y} r="14" fill={`url(#${uid}-glow)`} />}
        {!launched && <circle cx={tip.x} cy={tip.y} r="3" fill="#fffbe6" />}
        <g>
          {Array.from({ length: SPARK_POOL }, (_, i) => (
            <circle
              key={i}
              r="0"
              ref={(el) => {
                sparkEls.current[i] = el;
              }}
            />
          ))}
        </g>
        {/* the rocket */}
        <motion.g
          initial={false}
          animate={launched ? { y: -260, transition: reduce ? { duration: 0 } : { duration: 0.75, ease: [0.5, 0, 0.9, 0.6] } } : { y: 0, transition: { duration: 0 } }}
        >
          <g transform={`translate(${ROCKET_X} ${ROCKET_BASE})`}>
            {launched && !reduce && (
              <motion.path d="M -5 4 Q 0 60 5 4 Z" fill="#ff9f0a" initial={{ scaleY: 0 }} animate={{ scaleY: [0.6, 1.2, 0.8, 1.1] }} transition={{ duration: 0.4, repeat: Infinity }} />
            )}
            <path d="M -8 -12 L -15 1 L -8 -1 Z M 8 -12 L 15 1 L 8 -1 Z" className="fill-[#1d1d1f] dark:fill-[#f5f5f7]" />
            <rect x="-8" y="-60" width="16" height="60" rx="4" fill={`url(#${uid}-body)`} />
            <rect x="-8" y="-24" width="16" height="5" fill="#0a84ff" />
            <path d="M -8 -58 Q -7 -74 0 -84 Q 7 -74 8 -58 Z" className="fill-[#1d1d1f] dark:fill-[#f5f5f7]" />
          </g>
        </motion.g>
        <g>
          {Array.from({ length: BURST_COUNT }, (_, i) => (
            <circle
              key={i}
              r="0"
              ref={(el) => {
                burstEls.current[i] = el;
              }}
            />
          ))}
        </g>
        {!launched && <rect x={ROCKET_X - 22} y={ROCKET_BASE + 4} width="44" height="6" rx="3" className="fill-[#e8e8ed] dark:fill-[#3a3a3c]" />}
      </svg>
      <div className="flex items-center justify-between gap-3 px-6 pb-6 max-[400px]:px-4 max-[400px]:pb-4">
        <div aria-live="polite" className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            {launched ? (
              <motion.span
                key="live"
                className="block text-[15px] font-semibold"
                initial={reduce ? false : { opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: reduce ? { duration: 0 } : { delay: 0.7 } }}
                exit={{ opacity: 0 }}
              >
                {launchMessage}
              </motion.span>
            ) : (
              <motion.span
                key="wait"
                className="block text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                The fuse burns at the speed of the clock.
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={() => {
            touched.current = true;
            relight();
          }}
          className="h-9 flex-none rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:outline-[#0a84ff]"
        >
          {launched ? "Light another" : "Relight"}
        </button>
      </div>
    </div>
  );
}
```
