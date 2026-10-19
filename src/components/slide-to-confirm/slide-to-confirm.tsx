"use client";

import * as React from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SlideToConfirmSize = "sm" | "md" | "lg";
export type SlideToConfirmStatus = "idle" | "confirming" | "success";

export type SlideToConfirmProps = {
  /** Text inside the track before confirming. */
  label?: string;
  /** Text shown once confirmed. */
  successLabel?: string;
  /** Text shown while `onConfirm` is pending. */
  pendingLabel?: string;
  /** Runs when the knob reaches the end. Return a promise to show a pending state until it settles. */
  onConfirm?: () => void | Promise<unknown>;
  /** How far (0–1) the knob must travel before letting go confirms. */
  threshold?: number;
  /** Return to the start this many ms after success. `0` keeps the success state. */
  resetAfter?: number;
  /** Knob colour. Defaults to ink in light mode and white in dark mode. */
  accent?: string;
  /** Track colour once confirmed. */
  successColor?: string;
  size?: SlideToConfirmSize;
  /** Track width in px. Defaults per size. */
  width?: number;
  disabled?: boolean;
  className?: string;
};

const SIZES: Record<SlideToConfirmSize, { h: number; knob: number; w: number; icon: number; text: string }> = {
  sm: { h: 44, knob: 36, w: 260, icon: 16, text: "text-[13px]" },
  md: { h: 56, knob: 48, w: 300, icon: 18, text: "text-[15px]" },
  lg: { h: 64, knob: 56, w: 340, icon: 20, text: "text-[16px]" },
};

export function SlideToConfirm({
  label = "Slide to confirm",
  successLabel = "Confirmed",
  pendingLabel = "Confirming",
  onConfirm,
  threshold = 0.9,
  resetAfter = 2200,
  accent,
  successColor = "#16a34a",
  size = "md",
  width,
  disabled = false,
  className,
}: SlideToConfirmProps) {
  const reduced = useReducedMotion() ?? false;
  const dims = SIZES[size];
  const trackW = width ?? dims.w;
  const pad = (dims.h - dims.knob) / 2;
  const max = trackW - dims.knob - pad * 2;

  const [status, setStatus] = React.useState<SlideToConfirmStatus>("idle");
  const [dragging, setDragging] = React.useState(false);
  const [progressPct, setProgressPct] = React.useState(0);
  const x = useMotionValue(0);
  const knobX = useMotionValue(0); // shake offset for a failed confirm
  const anim = React.useRef<AnimationPlaybackControls | null>(null);
  const resetTimer = React.useRef<number | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const statusRef = React.useRef(status);
  React.useLayoutEffect(() => {
    statusRef.current = status;
  }, [status]);

  const progress = useTransform(x, (v) => Math.max(0, Math.min(1, v / max)));
  const labelOpacity = useTransform(progress, [0, 0.38], [1, 0]);
  const labelX = useTransform(progress, [0, 1], [0, 18]);
  const fillWidth = useTransform(x, (v) => Math.max(0, v) + dims.knob + pad * 2);
  const translate = useTransform([x, knobX], ([a, b]: number[]) => a + b);

  React.useEffect(() => progress.on("change", (p) => setProgressPct(Math.round(p * 100))), [progress]);

  React.useEffect(
    () => () => {
      anim.current?.stop();
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    },
    [],
  );

  const springTo = React.useCallback(
    (target: number, velocity = 0, onComplete?: () => void) => {
      anim.current?.stop();
      if (reduced) {
        x.set(target);
        onComplete?.();
        return;
      }
      anim.current = animate(x, target, {
        type: "spring",
        stiffness: 420,
        damping: 34,
        velocity,
        onComplete,
      });
    },
    [reduced, x],
  );

  const reset = React.useCallback(() => {
    setStatus("idle");
    springTo(0);
  }, [springTo]);

  const succeed = React.useCallback(() => {
    setStatus("success");
    if (resetAfter > 0) resetTimer.current = window.setTimeout(reset, resetAfter);
  }, [resetAfter, reset]);

  const shake = React.useCallback(() => {
    if (reduced) return;
    animate(knobX, [0, -7, 6, -4, 3, 0], { duration: 0.42, ease: "easeOut" });
  }, [knobX, reduced]);

  const confirm = React.useCallback(async () => {
    if (statusRef.current !== "idle") return;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(12);
    const result = onConfirm?.();
    if (result && typeof (result as Promise<unknown>).then === "function") {
      setStatus("confirming");
      try {
        await result;
        succeed();
      } catch {
        setStatus("idle");
        springTo(0);
        shake();
      }
      return;
    }
    succeed();
  }, [onConfirm, succeed, springTo, shake]);

  const finish = React.useCallback(() => {
    springTo(max, 0, () => void confirm());
  }, [springTo, max, confirm]);

  const interactive = !disabled && status === "idle";

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || e.button > 0) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.isTrusted) trackRef.current?.focus({ preventScroll: true });
    anim.current?.stop();
    setDragging(true);
    const el = trackRef.current;
    const scale = el ? el.getBoundingClientRect().width / el.offsetWidth || 1 : 1;
    const startX = e.clientX;
    const startV = x.get();
    let lastX = e.clientX;
    let lastT = performance.now();
    let vel = 0;

    const move = (ev: PointerEvent) => {
      const now = performance.now();
      vel = (((ev.clientX - lastX) / scale) / Math.max(1, now - lastT)) * 1000;
      lastX = ev.clientX;
      lastT = now;
      let next = startV + (ev.clientX - startX) / scale;
      // rubber band past either end
      if (next < 0) next *= 0.2;
      if (next > max) next = max + (next - max) * 0.15;
      x.set(next);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      const reach = x.get() / max;
      // a confident flick near the end counts too
      if (reach >= threshold || (reach > 0.6 && vel > 900)) finish();
      else springTo(0, vel);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  // keyboard: hold Enter/Space to slide across, or step with the arrow keys
  const holding = React.useRef(false);
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (e.repeat || holding.current) return;
      holding.current = true;
      anim.current?.stop();
      const remaining = 1 - x.get() / max;
      anim.current = animate(x, max, {
        duration: reduced ? 0 : 0.85 * remaining,
        ease: "linear",
        onComplete: () => {
          holding.current = false;
          void confirm();
        },
      });
      return;
    }
    const stepMap: Record<string, number> = { ArrowRight: 0.25, ArrowUp: 0.25, ArrowLeft: -0.25, ArrowDown: -0.25, Home: -1, End: 1 };
    if (!(e.key in stepMap)) return;
    e.preventDefault();
    const target = Math.max(0, Math.min(max, x.get() + stepMap[e.key] * max));
    if (target >= max - 0.5) finish();
    else springTo(target);
  };
  const onKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === "Enter" || e.key === " ") && holding.current) {
      holding.current = false;
      if (x.get() < max - 0.5) springTo(0);
    }
  };

  const done = status === "success";
  const pending = status === "confirming";

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progressPct}
      aria-valuetext={done ? successLabel : pending ? pendingLabel : `${progressPct}%`}
      aria-disabled={disabled || undefined}
      aria-roledescription="slide to confirm"
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      className={cn(
        "relative isolate inline-flex shrink-0 select-none items-center overflow-hidden rounded-full outline-none",
        "bg-white shadow-[inset_0_0_0_1px_rgba(23,24,26,0.07),inset_0_1px_3px_rgba(23,24,26,0.07),0_1px_2px_rgba(23,24,26,0.04)]",
        "dark:bg-white/[0.07] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]",
        "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#17181a]/40 dark:focus-visible:outline-white/40",
        disabled && "opacity-50",
        className,
      )}
      style={
        {
          width: trackW,
          height: dims.h,
          "--stc-success": successColor,
          ...(accent ? { "--stc-accent": accent } : null),
        } as React.CSSProperties
      }
    >
      {/* trail behind the knob, then the full success wash */}
      <motion.span
        aria-hidden
        className="absolute inset-y-0 left-0 rounded-full bg-[var(--stc-accent,#17181a)] opacity-[0.07] dark:bg-[var(--stc-accent,#ffffff)] dark:opacity-[0.09]"
        style={{ width: fillWidth }}
      />
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full"
        initial={false}
        animate={{ opacity: done ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.35 }}
        style={{ backgroundColor: successColor }}
      />

      {/* label */}
      <div
        className={cn("pointer-events-none absolute inset-0 flex items-center justify-center font-medium", dims.text)}
        style={{ paddingLeft: dims.knob + pad }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {done ? (
            <motion.span
              key="done"
              className="text-white"
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: reduced ? 0 : 0.3 }}
              style={{ marginLeft: -(dims.knob + pad) / 2 }}
            >
              {successLabel}
            </motion.span>
          ) : pending ? (
            <motion.span
              key="pending"
              className="text-[#73726d] dark:text-[#8e8d88]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ marginLeft: -(dims.knob + pad) }}
            >
              {pendingLabel}
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.span
                className={cn(
                  "block bg-clip-text text-transparent",
                  "bg-[linear-gradient(100deg,#8e8d88_0%,#8e8d88_40%,#17181a_50%,#8e8d88_60%,#8e8d88_100%)]",
                  "dark:bg-[linear-gradient(100deg,#6f6e6a_0%,#6f6e6a_40%,#ffffff_50%,#6f6e6a_60%,#6f6e6a_100%)]",
                )}
                style={{ backgroundSize: "250% 100%", opacity: labelOpacity, x: labelX }}
                animate={reduced || dragging ? undefined : { backgroundPositionX: ["100%", "-150%"] }}
                transition={{ duration: 2.4, ease: "linear", repeat: Infinity, repeatDelay: 0.4 }}
              >
                {label}
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* knob */}
      <motion.div
        aria-hidden
        onPointerDown={onPointerDown}
        data-done={done || undefined}
        className={cn(
          "absolute z-10 grid touch-none place-items-center rounded-full transition-colors duration-300",
          "bg-[var(--stc-accent,#17181a)] text-white dark:bg-[var(--stc-accent,#ffffff)]",
          accent ? "dark:text-white" : "dark:text-[#17181a]",
          "data-[done]:bg-white data-[done]:text-[var(--stc-success)] dark:data-[done]:bg-white dark:data-[done]:text-[var(--stc-success)]",
          "shadow-[0_1px_1px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.14)]",
          interactive ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        )}
        style={{
          left: pad,
          width: dims.knob,
          height: dims.knob,
          x: translate,
        }}
        animate={{ scale: dragging ? 0.94 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={status}
            className="grid place-items-center"
            initial={{ opacity: 0, scale: 0.4, rotate: -40 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 26 }}
          >
            {done ? (
              <Check size={dims.icon} strokeWidth={2.6} />
            ) : pending ? (
              <Loader2 size={dims.icon} strokeWidth={2.4} className="animate-spin" />
            ) : (
              <ArrowRight size={dims.icon} strokeWidth={2.4} />
            )}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
