"use client";

import * as React from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type AnimationPlaybackControls,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export type SlideToConfirmSize = "sm" | "md" | "lg";
export type SlideToConfirmStatus = "idle" | "confirming" | "success";

export type SlideToConfirmProps = {
  /** Text inside the track before confirming. */
  label?: string;
  /** Text shown once confirmed. */
  successLabel?: string;
  /** Text shown while `onConfirm` is pending. */
  pendingLabel?: string;
  /** Runs when the knob reaches the end. Return a promise to show a pending state until it settles; reject to bounce back. */
  onConfirm?: () => void | Promise<unknown>;
  /** How far (0-1) the knob must travel before letting go confirms. */
  threshold?: number;
  /** Return to the start this many ms after success. `0` keeps the success state. */
  resetAfter?: number;
  /** Colour of the trail behind the knob and the arrow. Defaults to system blue. */
  accent?: string;
  /** Track colour once confirmed. */
  successColor?: string;
  size?: SlideToConfirmSize;
  /** Track width in px. Defaults per size. */
  width?: number;
  /** Slides itself across and confirms (without calling `onConfirm`) until someone touches it. */
  autoplay?: boolean;
  disabled?: boolean;
  className?: string;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
};

const SIZES: Record<SlideToConfirmSize, { h: number; knob: number; w: number; icon: number; text: string }> = {
  sm: { h: 48, knob: 40, w: 260, icon: 16, text: "text-[14px]" },
  md: { h: 60, knob: 52, w: 300, icon: 18, text: "text-[16px]" },
  lg: { h: 68, knob: 60, w: 340, icon: 20, text: "text-[17px]" },
};

function Arrow({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M10.5 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className="animate-spin" aria-hidden="true">
      <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeOpacity=".2" strokeWidth="2.4" />
      <path d="M10 3a7 7 0 0 1 7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function Check({ size, still }: { size: number; still: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <motion.path
        d="M4.5 10.5 8.3 14.2 15.5 6.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={still ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.08 }}
      />
    </svg>
  );
}

/**
 * A slide-to-confirm track. The knob is rubbery: it stretches along the
 * track in proportion to how fast you drag it and squashes back when it
 * stops. A trail fills behind it, the label shimmers and fades as you pull,
 * and on release past the threshold the track floods with the success
 * colour while a check draws itself.
 */
export function SlideToConfirm({
  label = "Slide to confirm",
  successLabel = "Confirmed",
  pendingLabel = "Confirming",
  onConfirm,
  threshold = 0.9,
  resetAfter = 2200,
  accent,
  successColor = "#248a3d",
  size = "md",
  width,
  autoplay = false,
  disabled = false,
  className,
  enableSound = true,
}: SlideToConfirmProps) {
  const play = useSound(enableSound);
  const reduced = useReducedMotion() ?? false;
  const dims = SIZES[size];
  const trackW = width ?? dims.w;
  const pad = (dims.h - dims.knob) / 2;
  // The track may be squeezed below `trackW` by `max-w-full`; travel follows the real width.
  const [measured, setMeasured] = React.useState(trackW);
  const max = Math.max(1, Math.min(trackW, measured) - dims.knob - pad * 2);

  const [status, setStatus] = React.useState<SlideToConfirmStatus>("idle");
  const [dragging, setDragging] = React.useState(false);
  const [progressPct, setProgressPct] = React.useState(0);
  const x = useMotionValue(0);
  const shake = useMotionValue(0);
  const anim = React.useRef<AnimationPlaybackControls | null>(null);
  const resetTimer = React.useRef<number | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const touched = React.useRef(false);
  const statusRef = React.useRef(status);
  React.useLayoutEffect(() => {
    statusRef.current = status;
  }, [status]);
  const playRef = React.useRef(play);
  React.useEffect(() => {
    playRef.current = play;
  });

  const progress = useTransform(x, (v) => Math.max(0, Math.min(1, v / max)));
  const labelOpacity = useTransform(progress, [0, 0.45], [1, 0]);
  const labelX = useTransform(progress, [0, 1], [0, 26]);
  const trailWidth = useTransform(x, (v) => Math.max(0, v) + dims.knob + pad * 2);
  const trailOpacity = useTransform(progress, [0, 1], [0.1, 0.28]);
  const knobX = useTransform([x, shake], ([a, b]: number[]) => a + b);

  // Squash and stretch: speed stretches the knob along the track and thins it.
  const velocity = useVelocity(x);
  const stretchRaw = useTransform(velocity, (v) => (reduced ? 0 : Math.min(0.38, Math.abs(v) / 2600)));
  const stretch = useSpring(stretchRaw, { stiffness: 520, damping: 18 });
  const scaleX = useTransform(stretch, (s) => 1 + s);
  const scaleY = useTransform(stretch, (s) => 1 - s * 0.45);
  const originX = useTransform(velocity, (v) => (v < 0 ? 1 : 0));

  React.useEffect(() => progress.on("change", (p) => setProgressPct(Math.round(p * 100))), [progress]);

  React.useEffect(() => {
    const el = trackRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setMeasured(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
      anim.current = animate(x, target, { type: "spring", stiffness: 380, damping: 30, velocity, onComplete });
    },
    [reduced, x],
  );

  const reset = React.useCallback(() => {
    setStatus("idle");
    springTo(0);
  }, [springTo]);

  const succeed = React.useCallback(
    (after = resetAfter) => {
      setStatus("success");
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
      if (after > 0) resetTimer.current = window.setTimeout(reset, after);
    },
    [resetAfter, reset],
  );

  const bounceBack = React.useCallback(() => {
    setStatus("idle");
    springTo(0);
    if (!reduced) animate(shake, [0, -8, 7, -4, 3, 0], { duration: 0.45 });
  }, [springTo, shake, reduced]);

  const confirm = React.useCallback(async () => {
    if (statusRef.current !== "idle") return;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(12);
    const result = onConfirm?.();
    if (result && typeof (result as Promise<unknown>).then === "function") {
      setStatus("confirming");
      try {
        await result;
        play("success");
        succeed();
      } catch {
        play("error");
        bounceBack();
      }
      return;
    }
    play("success");
    succeed();
  }, [onConfirm, succeed, bounceBack, play]);

  const finish = React.useCallback(() => {
    springTo(max, 0, () => void confirm());
  }, [springTo, max, confirm]);

  React.useEffect(() => {
    if (!autoplay) return;
    let run: AnimationPlaybackControls | undefined;
    let detent = 0;
    let lastTick = 0;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      if (statusRef.current !== "idle") return;
      detent = 0;
      run = animate(x, max, {
        type: "spring",
        stiffness: 60,
        damping: 14,
        restDelta: 0.5,
        onUpdate: (v) => {
          // Same quarter-track ticks as a real drag.
          const d = Math.floor(Math.max(0, Math.min(1, v / max)) * 4);
          if (d === detent) return;
          detent = d;
          const now = performance.now();
          if (!touched.current && now - lastTick > 40) {
            lastTick = now;
            playRef.current.auto("tick", 0.4);
          }
        },
        onComplete: () => {
          if (touched.current) return;
          playRef.current.auto("success");
          succeed(1500);
        },
      });
    }, 3600);
    return () => {
      clearInterval(t);
      run?.stop();
    };
  }, [autoplay, x, max, succeed]);

  const interactive = !disabled && status === "idle";

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    touched.current = true;
    if (!interactive || e.button > 0) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.isTrusted) trackRef.current?.focus({ preventScroll: true });
    anim.current?.stop();
    x.stop();
    setDragging(true);
    const el = trackRef.current;
    const scale = el ? el.getBoundingClientRect().width / el.offsetWidth || 1 : 1;
    const startX = e.clientX;
    const startV = x.get();
    let lastX = e.clientX;
    let lastT = performance.now();
    let vel = 0;
    // A quiet tick each time the knob crosses a quarter of the track.
    const detentAt = (v: number) => Math.floor(Math.max(0, Math.min(1, v / max)) * 4);
    let detent = detentAt(startV);
    let lastTick = 0;

    const move = (ev: PointerEvent) => {
      const now = performance.now();
      vel = ((ev.clientX - lastX) / scale / Math.max(1, now - lastT)) * 1000;
      lastX = ev.clientX;
      lastT = now;
      let next = startV + (ev.clientX - startX) / scale;
      // Rubber band past either end.
      if (next < 0) next *= 0.2;
      if (next > max) next = max + (next - max) * 0.15;
      x.set(next);
      const d = detentAt(next);
      if (d !== detent) {
        detent = d;
        if (now - lastTick > 40) {
          lastTick = now;
          play("tick", 0.4);
        }
      }
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      const reach = x.get() / max;
      // A confident flick near the end counts too.
      if (reach >= threshold || (reach > 0.6 && vel > 900)) finish();
      else springTo(0, vel);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  // Keyboard: hold Enter or Space to slide across, or step with the arrow keys.
  const holding = React.useRef(false);
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    touched.current = true;
    if (!interactive) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (e.repeat || holding.current) return;
      holding.current = true;
      anim.current?.stop();
      const remaining = 1 - x.get() / max;
      anim.current = animate(x, max, {
        duration: reduced ? 0 : 0.8 * remaining,
        ease: [0.4, 0, 0.6, 1],
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
    if (target < max - 0.5 && Math.abs(target - x.get()) > 0.5) play("tick", 0.4);
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
        "relative isolate inline-flex max-w-full shrink-0 select-none items-center overflow-hidden rounded-full outline-none",
        "bg-[#f0f0f3] shadow-[inset_0_1px_2px_rgba(0,0,0,.06)] dark:bg-[#2c2c2e] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,.4)]",
        "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]",
        !accent && "[--stc-accent:#0071e3] dark:[--stc-accent:#0a84ff]",
        disabled && "opacity-50",
        className,
      )}
      style={{ width: trackW, height: dims.h, "--stc-success": successColor, ...(accent ? { "--stc-accent": accent } : null) } as React.CSSProperties}
    >
      <motion.span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 rounded-full bg-[var(--stc-accent)]"
        style={{ width: trailWidth, opacity: trailOpacity }}
      />
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full"
        initial={false}
        animate={{ clipPath: done ? "inset(0 0% 0 0 round 999px)" : `inset(0 100% 0 0 round 999px)` }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 22 }}
        style={{ backgroundColor: successColor }}
      />

      <div
        className={cn("pointer-events-none absolute inset-0 flex items-center justify-center font-semibold tracking-[-0.01em]", dims.text)}
        style={{ paddingLeft: dims.knob + pad }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {done ? (
            <motion.span
              key="done"
              className="text-white"
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 22 }}
              style={{ marginLeft: -(dims.knob + pad) / 2 }}
            >
              {successLabel}
            </motion.span>
          ) : pending ? (
            <motion.span key="pending" className="text-[#6e6e73] dark:text-[#a1a1a6]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {pendingLabel}
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.span
                className={cn(
                  "block bg-clip-text text-transparent",
                  "bg-[linear-gradient(100deg,#6e6e73_0%,#6e6e73_40%,#1d1d1f_50%,#6e6e73_60%,#6e6e73_100%)]",
                  "dark:bg-[linear-gradient(100deg,#a1a1a6_0%,#a1a1a6_40%,#ffffff_50%,#a1a1a6_60%,#a1a1a6_100%)]",
                )}
                style={{ backgroundSize: "250% 100%", opacity: labelOpacity, x: labelX }}
                animate={reduced || dragging ? undefined : { backgroundPositionX: ["100%", "-150%"] }}
                transition={{ duration: 2.6, ease: "linear", repeat: Infinity, repeatDelay: 0.3 }}
              >
                {label}
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        aria-hidden="true"
        onPointerDown={onPointerDown}
        className={cn("absolute z-10 touch-none", interactive ? "cursor-grab active:cursor-grabbing" : "cursor-default")}
        style={{ left: pad, width: dims.knob, height: dims.knob, x: knobX }}
      >
        <motion.div
          className={cn(
            "grid size-full place-items-center rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.12),0_6px_14px_-4px_rgba(0,0,0,.28)] dark:bg-[#f5f5f7]",
            done ? "text-[var(--stc-success)]" : "text-[var(--stc-accent)]",
          )}
          style={{ scaleX, scaleY, originX }}
          animate={{ scale: dragging ? 0.94 : 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 26 }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={status}
              className="grid place-items-center"
              initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 22 }}
            >
              {done ? <Check size={dims.icon + 2} still={reduced} /> : pending ? <Spinner size={dims.icon} /> : <Arrow size={dims.icon} />}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
