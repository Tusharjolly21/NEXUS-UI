"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Density = "low" | "medium" | "high";
type Direction = "up" | "down" | "random";

const DENSITY_MULTIPLIER: Record<Density, number> = {
  low: 0.7,
  medium: 1,
  high: 1.45,
};

type SparkleParticle = {
  id: string;
  x: number;
  y: number;
  size: number;
  alpha: number;
  duration: number;
  delay: number;
  dx: number;
  dy: number;
  bold: boolean;
};

type BurstParticle = {
  id: string;
  x: number;
  y: number;
  angle: number;
  distance: number;
  size: number;
};

export type SparklesProps = {
  count?: number;
  color?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  opacity?: number;
  className?: string;
  background?: boolean;
  density?: Density;
  direction?: Direction;
  enableGlow?: boolean;
  interactive?: boolean;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

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

function createParticles({
  count,
  minSize,
  maxSize,
  speed,
  opacity,
  direction,
  seed,
}: Required<Pick<SparklesProps, "count" | "minSize" | "maxSize" | "speed" | "opacity" | "direction">> & {
  seed: number;
}) {
  const total = Math.max(6, Math.round(count));
  const min = Math.max(0.6, minSize);
  const max = Math.max(min + 0.2, maxSize);
  const velocity = clamp(speed, 0.2, 3);
  const baseOpacity = clamp(opacity, 0.1, 1);
  const rand = createSeededRandom(seed);

  return Array.from({ length: total }, (_, index): SparkleParticle => {
    const bold = rand() < 0.2;
    const size = (min + rand() * (max - min)) * (bold ? 1.5 : 1);
    const alpha = Math.min(1, (0.25 + rand() * 0.75) * baseOpacity * (bold ? 1.35 : 1));

    let dy = 0;
    if (direction === "up") dy = -(4 + rand() * 16);
    else if (direction === "down") dy = 4 + rand() * 16;
    else dy = (rand() * 2 - 1) * (4 + rand() * 16);

    const dx = (rand() * 2 - 1) * (4 + rand() * 14);

    return {
      id: `sparkle-${index}`,
      x: rand() * 100,
      y: rand() * 100,
      size,
      alpha,
      duration: (2.8 + rand() * 4.4) / velocity,
      delay: rand() * 3.2,
      dx,
      dy,
      bold,
    };
  });
}

export function Sparkles({
  count = 36,
  color = "#e5f4ff",
  minSize = 0.9,
  maxSize = 2.8,
  speed = 1,
  opacity = 0.9,
  className,
  background = false,
  density = "medium",
  direction = "random",
  enableGlow = true,
  interactive = false,
}: SparklesProps) {
  const reduceMotion = useReducedMotion() === true;
  const ref = React.useRef<HTMLDivElement>(null);

  const totalCount = React.useMemo(
    () => Math.round(Math.max(4, count) * DENSITY_MULTIPLIER[density]),
    [count, density],
  );

  const particles = React.useMemo(
    () => {
      const seed = hashString(
        [totalCount, minSize, maxSize, speed, opacity, direction, color].join("|"),
      );
      return createParticles({
        count: totalCount,
        minSize,
        maxSize,
        speed,
        opacity,
        direction,
        seed,
      });
    },
    [color, direction, maxSize, minSize, opacity, speed, totalCount],
  );

  const [cursor, setCursor] = React.useState<{ x: number; y: number } | null>(null);
  const [bursts, setBursts] = React.useState<BurstParticle[]>([]);
  const lastMoveRef = React.useRef(0);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!interactive || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCursor({ x, y });

    const now = performance.now();
    if (now - lastMoveRef.current < 72) return;
    lastMoveRef.current = now;

    const spark: BurstParticle = {
      id: `move-${now}-${Math.random().toString(36).slice(2, 8)}`,
      x,
      y,
      angle: Math.random() * Math.PI * 2,
      distance: 6 + Math.random() * 12,
      size: 0.8 + Math.random() * 1.8,
    };
    setBursts((prev) => [...prev.slice(-28), spark]);
  }

  function handlePointerLeave() {
    setCursor(null);
  }

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!interactive || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const clickBurst = Array.from({ length: 16 }, (_, i): BurstParticle => ({
      id: `click-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
      x,
      y,
      angle: (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.24,
      distance: 10 + Math.random() * 20,
      size: 1 + Math.random() * 2.3,
    }));
    setBursts((prev) => [...prev.slice(-20), ...clickBurst]);
  }

  React.useEffect(() => {
    if (bursts.length === 0) return;
    const timeout = window.setTimeout(() => {
      setBursts((prev) => prev.slice(-8));
    }, 620);
    return () => window.clearTimeout(timeout);
  }, [bursts]);

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      className={cn(
        "overflow-hidden",
        background ? (interactive ? "absolute inset-0" : "pointer-events-none absolute inset-0") : "relative",
        className,
      )}
      aria-hidden
    >
      {interactive && cursor ? (
        <motion.div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${cursor.x}%`,
            top: `${cursor.y}%`,
            width: 220,
            height: 220,
            background: `radial-gradient(circle, ${color}26 0%, ${color}08 38%, transparent 72%)`,
            filter: "blur(10px)",
          }}
        />
      ) : null}

      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: color,
            boxShadow: enableGlow ? `0 0 ${particle.size * (particle.bold ? 9 : 5.5)}px ${color}` : undefined,
            opacity: reduceMotion ? Math.min(0.55, particle.alpha) : particle.alpha,
          }}
          animate={
            reduceMotion
              ? { opacity: particle.alpha * 0.45 }
              : {
                  opacity: [0, particle.alpha * 0.75, particle.alpha, particle.alpha * 0.65, 0],
                  x: [0, particle.dx, 0],
                  y: [0, particle.dy, 0],
                  scale: particle.bold ? [0.8, 1.45, 0.85] : [0.55, 1.15, 0.72],
                }
          }
          transition={
            reduceMotion
              ? { duration: 0.1 }
              : {
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />
      ))}

      <AnimatePresence>
        {bursts.map((burst) => (
          <motion.span
            key={burst.id}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: `${burst.x}%`,
              top: `${burst.y}%`,
              width: burst.size,
              height: burst.size,
              backgroundColor: color,
              boxShadow: enableGlow ? `0 0 ${burst.size * 7}px ${color}` : undefined,
            }}
            initial={{ opacity: 0.9, scale: 0.72, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              scale: 0.2,
              x: Math.cos(burst.angle) * burst.distance,
              y: Math.sin(burst.angle) * burst.distance,
              filter: "blur(2px)",
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.2 : 0.54, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
