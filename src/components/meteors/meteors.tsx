"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type MeteorsIntensity = "low" | "medium" | "high";

export type MeteorsProps = {
  number?: number;
  className?: string;
  meteorClassName?: string;
  minDelay?: number;
  maxDelay?: number;
  minDuration?: number;
  maxDuration?: number;
  angle?: number;
  glow?: boolean;
  color?: string;
  intensity?: MeteorsIntensity;
  hoverOnly?: boolean;
  children?: React.ReactNode;
};

type MeteorConfig = {
  id: string;
  left: number;
  top: number;
  length: number;
  delay: number;
  duration: number;
  repeatDelay: number;
  distance: number;
  headSize: number;
  opacity: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed: number) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6d2b79f5;
    let n = Math.imul(t ^ (t >>> 15), 1 | t);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

const intensityMultiplier: Record<MeteorsIntensity, number> = {
  low: 0.65,
  medium: 1,
  high: 1.45,
};

export function Meteors({
  number = 18,
  className,
  meteorClassName,
  minDelay = 0.12,
  maxDelay = 2.4,
  minDuration = 3.2,
  maxDuration = 7.2,
  angle = 215,
  glow = true,
  color = "hsl(var(--primary) / 0.95)",
  intensity = "medium",
  hoverOnly = false,
  children,
}: MeteorsProps) {
  const reduceMotion = useReducedMotion() === true;
  const [active, setActive] = React.useState(!hoverOnly);

  React.useEffect(() => {
    if (!hoverOnly) setActive(true);
  }, [hoverOnly]);

  const safeMinDelay = Math.max(0, minDelay);
  const safeMaxDelay = Math.max(safeMinDelay + 0.05, maxDelay);
  const safeMinDuration = Math.max(0.6, minDuration);
  const safeMaxDuration = Math.max(safeMinDuration + 0.2, maxDuration);

  const meteorCount = clamp(
    Math.round(number * intensityMultiplier[intensity]),
    1,
    72,
  );

  const meteors = React.useMemo<MeteorConfig[]>(() => {
    const seed = hashString(
      [
        meteorCount,
        safeMinDelay,
        safeMaxDelay,
        safeMinDuration,
        safeMaxDuration,
        angle,
        color,
        intensity,
      ].join("|"),
    );
    const rand = createSeededRandom(seed);
    return Array.from({ length: meteorCount }, (_, idx) => ({
      id: `meteor-${idx}`,
      left: -12 + rand() * 124,
      top: -46 + rand() * 92,
      length: 88 + rand() * 110,
      delay: safeMinDelay + rand() * (safeMaxDelay - safeMinDelay),
      duration: safeMinDuration + rand() * (safeMaxDuration - safeMinDuration),
      repeatDelay: 0.2 + rand() * 1.8,
      distance: 260 + rand() * 420,
      headSize: 2 + rand() * 2.2,
      opacity: 0.4 + rand() * 0.45,
    }));
  }, [
    angle,
    color,
    intensity,
    meteorCount,
    safeMaxDelay,
    safeMaxDuration,
    safeMinDelay,
    safeMinDuration,
  ]);

  // Rotate controls beam direction; travel goes "forward" through the card.
  const radians = ((angle - 180) * Math.PI) / 180;
  const travelX = Math.cos(radians);
  const travelY = Math.sin(radians);

  return (
    <div
      className={cn("relative isolate overflow-hidden", className)}
      onMouseEnter={hoverOnly ? () => setActive(true) : undefined}
      onMouseLeave={hoverOnly ? () => setActive(false) : undefined}
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        {meteors.map((meteor) => {
          const tx = travelX * meteor.distance;
          const ty = travelY * meteor.distance;
          return (
            <motion.span
              key={meteor.id}
              aria-hidden
              className={cn("absolute left-0 top-0 block origin-left", meteorClassName)}
              style={{
                left: `${meteor.left}%`,
                top: `${meteor.top}%`,
                width: meteor.length,
                height: 1.8,
                rotate: `${angle}deg`,
                opacity: active ? 1 : 0,
                backgroundImage: `linear-gradient(90deg, transparent 0%, ${color} 72%, ${color} 100%)`,
                filter: glow ? `drop-shadow(0 0 7px ${color})` : undefined,
              }}
              initial={reduceMotion ? { x: 0, y: 0, opacity: meteor.opacity * 0.45 } : undefined}
              animate={
                reduceMotion
                  ? { opacity: meteor.opacity * 0.45 }
                  : {
                      x: [0, tx],
                      y: [0, ty],
                      opacity: [0, meteor.opacity, meteor.opacity, 0],
                    }
              }
              transition={
                reduceMotion
                  ? { duration: 0.2 }
                  : {
                      duration: meteor.duration,
                      delay: meteor.delay,
                      repeat: Infinity,
                      repeatDelay: meteor.repeatDelay,
                      ease: "linear",
                    }
              }
            >
              <span
                className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: meteor.headSize,
                  height: meteor.headSize,
                  backgroundColor: color,
                  boxShadow: glow ? `0 0 14px ${color}, 0 0 24px ${color}` : undefined,
                }}
              />
            </motion.span>
          );
        })}
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
