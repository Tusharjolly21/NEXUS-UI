"use client";

import * as React from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type GlowingEffectProps = {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  borderRadius?: string;
  disabled?: boolean;
  intensity?: number;
  blur?: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function GlowingEffect({
  children,
  className,
  glowColor = "#7dd3fc",
  borderRadius = "1rem",
  disabled = false,
  intensity = 1,
  blur = 18,
}: GlowingEffectProps) {
  const reduceMotion = useReducedMotion() === true;
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [active, setActive] = React.useState(false);

  const safeIntensity = clamp(intensity, 0.45, 2.4);
  const safeBlur = Math.max(0, blur);

  const borderGlow = useMotionTemplate`radial-gradient(${170 * safeIntensity}px circle at ${x}px ${y}px, #7dd3fc 0%, transparent 70%),
    radial-gradient(${150 * safeIntensity}px circle at calc(${x}px + 30px) calc(${y}px - 20px), #a78bfa 0%, transparent 72%),
    radial-gradient(${140 * safeIntensity}px circle at calc(${x}px - 34px) calc(${y}px + 16px), #f472b6 0%, transparent 74%)`;
  const ambientGlow = useMotionTemplate`radial-gradient(${250 * safeIntensity}px circle at ${x}px ${y}px, #7dd3fc22 0%, transparent 72%),
    radial-gradient(${220 * safeIntensity}px circle at calc(${x}px + 34px) calc(${y}px - 24px), #a78bfa1f 0%, transparent 74%),
    radial-gradient(${210 * safeIntensity}px circle at calc(${x}px - 32px) calc(${y}px + 18px), #f472b61c 0%, transparent 74%)`;

  function updatePointer(clientX: number, clientY: number) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    x.set(clientX - rect.left);
    y.set(clientY - rect.top);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled || reduceMotion) return;
    if (!active) setActive(true);
    updatePointer(e.clientX, e.clientY);
  }

  function onEnter(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled) return;
    setActive(true);
    updatePointer(e.clientX, e.clientY);
  }

  function onLeave() {
    setActive(false);
  }

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "group relative isolate overflow-hidden border-2 border-white/20 bg-card/95",
        className,
      )}
      style={{ borderRadius }}
      onPointerMove={onPointerMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocus={() => !disabled && setActive(true)}
      onBlur={() => setActive(false)}
      animate={disabled ? { y: 0 } : { y: active ? -2 : 0 }}
      transition={{ duration: reduceMotion ? 0.1 : 0.2, ease: "easeOut" }}
      tabIndex={0}
    >
      {!disabled ? (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-[inherit]"
            style={{
              boxShadow:
                `0 0 ${18 * safeIntensity}px #7dd3fc, ` +
                `0 0 ${24 * safeIntensity}px #a78bfa, ` +
                `0 0 ${32 * safeIntensity}px #f472b6`,
              opacity: active ? 0.95 : 0,
            }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{
              backgroundImage: ambientGlow,
              opacity: active ? clamp(0.18 * safeIntensity, 0, 0.35) : 0,
              filter: `blur(${safeBlur * 0.9}px)`,
            }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] p-[2px]"
            style={{
              backgroundImage: borderGlow,
              opacity: active ? clamp(1.35 * safeIntensity, 0, 1) : 0,
              filter:
                `drop-shadow(0 0 ${12 * safeIntensity}px #7dd3fc)` +
                ` drop-shadow(0 0 ${10 * safeIntensity}px #a78bfa)` +
                ` drop-shadow(0 0 ${8 * safeIntensity}px #f472b6)`,
            }}
            transition={{ duration: 0.2 }}
          />
        </>
      ) : null}

      <div className="pointer-events-none absolute inset-[2px] rounded-[inherit] bg-gradient-to-b from-background/98 to-background/90 dark:from-zinc-950/98 dark:to-zinc-950/92" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
