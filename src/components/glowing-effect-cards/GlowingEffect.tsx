"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

export type GlowingEffectProps = {
  children: ReactNode;
  className?: string;
  /** Lead colour of the light. Used as the first of `colors` when `colors` is not set. */
  glowColor?: string;
  /** Colours along the lit arc, from tail to head. */
  colors?: string[];
  /** Corner radius, any CSS length. */
  borderRadius?: string;
  /** Turns the light off. */
  disabled?: boolean;
  /** Rim thickness and brightness multiplier (0.5-2). */
  intensity?: number;
  /** Blur of the soft bloom outside the rim, in px. */
  blur?: number;
  /** Width of the lit arc, in degrees. */
  spread?: number;
  /** How far outside the card the pointer still lights it, in px. */
  proximity?: number;
};

/** Shared virtual pointer (client coordinates). GlowingCardsLayout uses it to demo the light. */
export const GlowPointerContext = createContext<{ x: MotionValue<number>; y: MotionValue<number> } | null>(null);

const DEFAULT_COLORS = ["#5ac8fa", "#0a84ff", "#bf5af2", "#ff375f", "#ff9f0a"];
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/**
 * Wraps any content in a hairline rim that lights up on the side nearest the
 * pointer. The lit arc chases the pointer round the edge on a spring, so it
 * swings past and settles; neighbouring cards catch the light as the pointer
 * nears them, and a press flares it.
 */
export function GlowingEffect({
  children,
  className = "",
  glowColor,
  colors,
  borderRadius = "22px",
  disabled = false,
  intensity = 1,
  blur = 18,
  spread = 90,
  proximity = 72,
}: GlowingEffectProps) {
  const still = useReducedMotion() === true;
  const ref = useRef<HTMLDivElement>(null);
  const shared = useContext(GlowPointerContext);
  const stops = colors && colors.length > 0 ? colors : glowColor ? [glowColor, ...DEFAULT_COLORS.slice(1)] : DEFAULT_COLORS;
  const k = clamp(intensity, 0.5, 2);
  const arc = clamp(spread, 20, 300);

  const angleTarget = useMotionValue(0);
  const angle = useSpring(angleTarget, still ? { stiffness: 1000, damping: 100 } : { stiffness: 110, damping: 13, mass: 0.9 });
  const litTarget = useMotionValue(0);
  const lit = useSpring(litTarget, { stiffness: 140, damping: 22 });
  const flare = useMotionValue(0);
  const glow = useTransform([lit, flare], ([l, f]) => clamp((l as number) + (f as number), 0, 1.6));
  const from = useTransform(angle, (a) => a - arc / 2);

  const gradient = useMotionTemplate`conic-gradient(from ${from}deg at 50% 50%, transparent 0deg, ${stops
    .map((c, i) => `${c} ${Math.round(((i + 1) / (stops.length + 1)) * arc)}deg`)
    .join(", ")}, transparent ${arc}deg, transparent 360deg)`;
  const bloomOpacity = useTransform(glow, (g) => g * 0.7);

  const proximityRef = useRef(proximity);
  const disabledRef = useRef(disabled);
  // Track a point in client coordinates; unwrap the angle so the spring always takes the short way round.
  const aim = useRef((cx: number, cy: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = cx - (r.left + r.width / 2);
    const dy = cy - (r.top + r.height / 2);
    const outside = Math.max(0, Math.max(r.left - cx, cx - r.right, r.top - cy, cy - r.bottom));
    const near = 1 - clamp(outside / proximityRef.current, 0, 1);
    litTarget.set(disabledRef.current ? 0 : near);
    if (near <= 0) return;
    const a = (Math.atan2(dx, -dy) * 180) / Math.PI;
    const cur = angleTarget.get();
    const delta = ((((a - cur) % 360) + 540) % 360) - 180;
    angleTarget.set(cur + delta);
  });
  useEffect(() => {
    proximityRef.current = proximity;
    disabledRef.current = disabled;
    if (disabled) litTarget.set(0);
  }, [proximity, disabled, litTarget]);

  useEffect(() => {
    let raf = 0;
    let px = 0;
    let py = 0;
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        aim.current(px, py);
      });
    };
    const onLeave = () => litTarget.set(0);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [litTarget]);

  const fallback = useMotionValue(-1e6);
  useMotionValueEvent(shared?.x ?? fallback, "change", () => {
    if (shared) aim.current(shared.x.get(), shared.y.get());
  });

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{ borderRadius }}
      onPointerDown={() => {
        if (disabled || still) return;
        flare.set(0.7);
        animate(flare, 0, { type: "spring", stiffness: 70, damping: 16 });
      }}
    >
      {!disabled ? (
        <>
          <motion.div
            className="pointer-events-none absolute -inset-px"
            style={{ borderRadius, background: gradient, opacity: bloomOpacity, filter: `blur(${Math.max(0, blur)}px)` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-white dark:bg-[#1c1c1e]" style={{ borderRadius }} aria-hidden="true" />
          <motion.div
            className="pointer-events-none absolute inset-0 z-[2]"
            style={{
              borderRadius,
              padding: 1.5 * k,
              background: gradient,
              opacity: glow,
              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
            }}
            aria-hidden="true"
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-white dark:bg-[#1c1c1e]" style={{ borderRadius }} aria-hidden="true" />
      )}
      <div
        className="relative z-[1] h-full shadow-[0_0_0_1px_rgba(0,0,0,.06),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]"
        style={{ borderRadius }}
      >
        {children}
      </div>
    </div>
  );
}
