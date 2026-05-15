"use client";

import * as React from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type BackgroundGradientAs = "div" | "button" | "section";

export type BackgroundGradientProps = {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  surfaceClassName?: string;
  colors?: string[];
  animationSpeed?: number;
  blur?: number;
  borderRadius?: string;
  as?: BackgroundGradientAs;
  interactive?: boolean;
  disabled?: boolean;
};

const DEFAULT_COLORS = ["#22d3ee", "#818cf8", "#a855f7", "#ec4899"];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function BackgroundGradient({
  children,
  className,
  containerClassName,
  surfaceClassName,
  colors = DEFAULT_COLORS,
  animationSpeed = 1,
  blur = 24,
  borderRadius = "1rem",
  as = "div",
  interactive = true,
  disabled = false,
}: BackgroundGradientProps) {
  const reduceMotion = useReducedMotion() === true;
  const [isHovered, setIsHovered] = React.useState(false);
  const ref = React.useRef<HTMLElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const safeColors = colors.length >= 2 ? colors : DEFAULT_COLORS;
  const speed = clamp(animationSpeed, 0.2, 3);
  const blurPx = Math.max(0, blur);

  const radialGlow = useMotionTemplate`radial-gradient(260px circle at ${x}px ${y}px, ${
    safeColors[0]
  }33 0%, transparent 70%)`;

  const gradientMain = `linear-gradient(120deg, ${safeColors[0]} 0%, ${safeColors[1]} 35%, ${
    safeColors[2] ?? safeColors[0]
  } 68%, ${safeColors[3] ?? safeColors[1]} 100%)`;
  const gradientSoft = `linear-gradient(300deg, ${safeColors[1]}66 0%, ${safeColors[2] ?? safeColors[0]}44 55%, ${
    safeColors[0]
  }66 100%)`;
  const glowShadow = isHovered
    ? `0 20px 55px -24px ${safeColors[0]}99, 0 10px 30px -18px ${safeColors[2] ?? safeColors[1]}88`
    : `0 16px 44px -24px ${safeColors[0]}7a, 0 8px 24px -16px ${safeColors[2] ?? safeColors[1]}66`;

  function onMove(e: React.MouseEvent<HTMLElement>) {
    if (!interactive || reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  }

  const commonProps = {
    ref: ref as React.Ref<any>,
    onMouseMove: onMove,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    className: cn(
      "group relative isolate inline-flex overflow-hidden border border-white/15 bg-black/85 text-white",
      className,
    ),
    style: { borderRadius, boxShadow: glowShadow },
  };

  const content = (
    <>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-[-35%]"
        style={{
          backgroundImage: gradientMain,
          filter: `blur(${blurPx}px)`,
          opacity: reduceMotion ? 0.55 : isHovered ? 0.86 : 0.72,
          willChange: "transform, opacity, background-position",
        }}
        animate={
          reduceMotion
            ? undefined
            : {
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                rotate: [0, 6, -4, 0],
                scale: isHovered ? 1.08 : 1,
              }
        }
        transition={{ duration: 12 / speed, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: gradientSoft, opacity: isHovered ? 0.48 : 0.3 }}
        animate={reduceMotion ? undefined : { opacity: isHovered ? 0.52 : 0.34 }}
        transition={{ duration: 0.25 }}
      />
      {interactive && !reduceMotion ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: radialGlow, opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      ) : null}
      <span
        className={cn(
          "absolute inset-[1px] rounded-[inherit] bg-background/72 dark:bg-black/48",
          surfaceClassName,
        )}
        aria-hidden
      />
      <div className={cn("relative z-10 w-full", containerClassName)}>{children}</div>
    </>
  );

  if (as === "button") {
    return (
      <motion.button
        type="button"
        disabled={disabled}
        {...commonProps}
        whileTap={disabled ? undefined : { scale: 0.985 }}
      >
        {content}
      </motion.button>
    );
  }

  if (as === "section") {
    return <motion.section {...commonProps}>{content}</motion.section>;
  }

  return <motion.div {...commonProps}>{content}</motion.div>;
}
