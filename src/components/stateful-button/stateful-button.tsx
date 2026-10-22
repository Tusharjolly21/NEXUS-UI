"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

type Phase = "idle" | "loading" | "success" | "error";

const variantClasses: Record<NonNullable<StatefulButtonProps["variant"]>, string> = {
  default:
    "bg-[#0071e3] text-white shadow-[0_1px_0_rgba(255,255,255,.18)_inset,0_10px_24px_-14px_rgba(0,113,227,.9)] hover:bg-[#0077ed] dark:bg-[#0a84ff] dark:hover:bg-[#2b94ff] dark:text-white",
  outline:
    "bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.1),0_10px_24px_-18px_rgba(0,0,0,.4)] hover:bg-[#fafafa] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.14)] dark:hover:bg-[#2c2c2e]",
  ghost: "bg-transparent text-[#0066cc] hover:bg-[#0071e3]/[0.07] dark:text-[#2997ff] dark:hover:bg-[#0a84ff]/[0.12]",
  destructive: "bg-[#d70015] text-white shadow-[0_10px_24px_-14px_rgba(215,0,21,.9)] hover:bg-[#e3001a] dark:bg-[#d70015]",
};

const phaseClasses: Record<Exclude<Phase, "idle" | "loading">, string> = {
  success: "bg-[#248a3d]! text-white! shadow-[0_10px_24px_-14px_rgba(36,138,61,.9)]",
  error: "bg-[#d70015]! text-white! shadow-[0_10px_24px_-14px_rgba(215,0,21,.9)]",
};

const sizeClasses: Record<NonNullable<StatefulButtonProps["size"]>, { cls: string; icon: number }> = {
  sm: { cls: "h-9 px-4 text-[13px]", icon: 14 },
  md: { cls: "h-11 px-5 text-[15px]", icon: 16 },
  lg: { cls: "h-[52px] px-7 text-[17px]", icon: 18 },
};

export type StatefulButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDrag" | "onDragEnd" | "onDragStart"
> & {
  children: React.ReactNode;
  /** Label while `onClick` is pending. */
  loadingText?: string;
  /** Label after `onClick` resolves. */
  successText?: string;
  /** Label after `onClick` throws or rejects. */
  errorText?: string;
  /** Runs on click. Return a promise to show the loading state until it settles. */
  onClick?: () => Promise<void> | void;
  /** How long the success or error state stays before the button resets, in ms. */
  resetDelay?: number;
  /** Show the success state after `onClick` resolves (otherwise go straight back to idle). */
  showSuccess?: boolean;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  /** Icon before the idle label. */
  icon?: React.ReactNode;
  /** Replaces the drawn check in the success state. */
  successIcon?: React.ReactNode;
  /** Replaces the drawn alert in the error state. */
  errorIcon?: React.ReactNode;
  /** Runs through loading and success on a loop (without calling `onClick`) until someone presses it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
};

function Spinner({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="animate-spin" aria-hidden="true">
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity=".28" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DrawnCheck({ size, still }: { size: number; still: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <motion.path
        d="M3.4 8.4 6.6 11.4 12.8 4.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={still ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 20, delay: 0.1 }}
      />
    </svg>
  );
}

function DrawnAlert({ size, still }: { size: number; still: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <motion.circle cx="8" cy="8" r="6.4" fill="none" stroke="currentColor" strokeWidth="1.8" initial={still ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ type: "spring", stiffness: 200, damping: 22 }} />
      <path d="M8 4.8v3.8M8 10.9v.3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

/**
 * A button that shows its own async work. Pressed, it squashes; while the
 * promise runs a light sweeps across it and the label rolls to the loading
 * text with the width springing to fit; on success it turns green, pops
 * with a small overshoot and draws a check; on failure it turns red and
 * shakes. Then it settles back.
 */
export function StatefulButton({
  children,
  loadingText = "Loading",
  successText = "Done",
  errorText = "Something went wrong",
  onClick,
  disabled,
  resetDelay = 1800,
  showSuccess = true,
  className,
  variant = "default",
  size = "md",
  icon,
  successIcon,
  errorIcon,
  autoplay = false,
  enableSound = true,
  type = "button",
  onPointerDown,
  onKeyDown,
  ...buttonProps
}: StatefulButtonProps) {
  const reduceMotion = useReducedMotion() === true;
  const play = useSound(enableSound);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const resetRef = React.useRef<number | null>(null);
  const touched = React.useRef(false);
  const dims = sizeClasses[size];

  const isLoading = phase === "loading";
  const isDisabled = disabled || isLoading;

  const clearResetTimer = React.useCallback(() => {
    if (resetRef.current !== null) {
      window.clearTimeout(resetRef.current);
      resetRef.current = null;
    }
  }, []);

  const scheduleReset = React.useCallback(
    (delay = resetDelay) => {
      clearResetTimer();
      resetRef.current = window.setTimeout(() => setPhase("idle"), Math.max(300, delay));
    },
    [clearResetTimer, resetDelay],
  );

  React.useEffect(() => clearResetTimer, [clearResetTimer]);

  React.useEffect(() => {
    if (!autoplay) return;
    let step: ReturnType<typeof setTimeout> | undefined;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      setPhase("loading");
      step = setTimeout(() => {
        if (touched.current) return;
        setPhase("success");
        step = setTimeout(() => !touched.current && setPhase("idle"), 1400);
      }, 1400);
    }, 4200);
    return () => {
      clearInterval(t);
      clearTimeout(step);
    };
  }, [autoplay]);

  async function handleClick() {
    touched.current = true;
    if (isDisabled) return;
    clearResetTimer();
    play("tap");
    setPhase("loading");
    try {
      await onClick?.();
      if (showSuccess) {
        play("success");
        setPhase("success");
        scheduleReset();
      } else {
        setPhase("idle");
      }
    } catch {
      play("error");
      setPhase("error");
      scheduleReset(Math.max(1400, resetDelay));
    }
  }

  const content =
    phase === "loading"
      ? { key: "loading", label: loadingText, glyph: <Spinner size={dims.icon} /> }
      : phase === "success"
        ? { key: "success", label: successText, glyph: successIcon ?? <DrawnCheck size={dims.icon} still={reduceMotion} /> }
        : phase === "error"
          ? { key: "error", label: errorText, glyph: errorIcon ?? <DrawnAlert size={dims.icon} still={reduceMotion} /> }
          : { key: "idle", label: children, glyph: icon };

  const spring = { type: "spring" as const, stiffness: 420, damping: 30 };

  return (
    <motion.button
      type={type}
      layout={!reduceMotion}
      aria-busy={isLoading}
      aria-live="polite"
      disabled={isDisabled}
      onClick={handleClick}
      onPointerDown={(e: React.PointerEvent<HTMLButtonElement>) => {
        touched.current = true;
        onPointerDown?.(e);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
        touched.current = true;
        onKeyDown?.(e);
      }}
      whileTap={reduceMotion || isDisabled ? undefined : { scaleX: 1.04, scaleY: 0.92 }}
      animate={
        reduceMotion
          ? undefined
          : phase === "success"
            ? { scale: [1, 1.08, 0.98, 1], x: 0 }
            : phase === "error"
              ? { x: [0, -7, 6, -4, 3, 0], scale: 1 }
              : { scale: 1, x: 0 }
      }
      transition={{ layout: spring, scale: { duration: 0.5, ease: [0.3, 1.4, 0.5, 1] }, x: { duration: 0.42 }, default: spring }}
      style={{ borderRadius: 999 }}
      className={cn(
        "relative inline-flex select-none items-center justify-center overflow-hidden whitespace-nowrap font-semibold tracking-[-0.01em] outline-none transition-[background-color,color,box-shadow] duration-300",
        "focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f5f7] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black",
        "disabled:cursor-default",
        disabled && "opacity-50",
        variantClasses[variant],
        phase === "success" || phase === "error" ? phaseClasses[phase] : null,
        dims.cls,
        className,
      )}
      {...buttonProps}
    >
      {isLoading && !reduceMotion ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-1/2 bg-[linear-gradient(100deg,transparent,rgba(255,255,255,.35),transparent)]"
          initial={{ left: "-50%" }}
          animate={{ left: "110%" }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], repeat: Infinity, repeatDelay: 0.15 }}
        />
      ) : null}
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={content.key}
          layout={reduceMotion ? false : "position"}
          className="relative inline-flex items-center gap-2"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16, filter: "blur(4px)" }}
          transition={reduceMotion ? { duration: 0.1 } : { type: "spring", stiffness: 460, damping: 30 }}
        >
          {content.glyph ? <span className="inline-grid place-items-center">{content.glyph}</span> : null}
          <span>{content.label}</span>
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
