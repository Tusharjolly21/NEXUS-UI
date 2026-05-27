"use client";

import * as React from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export type ScrollProgressBarProps = {
  targetRef?: React.RefObject<HTMLElement | null>;
  containerRef?: React.RefObject<HTMLElement | null>;
  progress?: MotionValue<number>;
  backgroundColor?: string;
  fillColor?: string;
  height?: number | string;
  width?: number | string;
  markerCount?: number;
  markerSize?: number;
  showMarkers?: boolean;
  stiffness?: number;
  damping?: number;
  className?: string;
  ariaLabel?: string;
};

function ProgressMarker({
  index,
  total,
  progress,
  fillColor,
  backgroundColor,
  size,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
  fillColor: string;
  backgroundColor: string;
  size: number;
}) {
  const threshold = total <= 1 ? 0 : index / (total - 1);
  const markerColor = useTransform(progress, (value) =>
    value + 0.004 >= threshold ? fillColor : backgroundColor,
  );
  const markerScale = useTransform(progress, (value) =>
    Math.abs(value - threshold) < 0.1 ? 1.16 : 1,
  );

  return (
    <motion.span
      aria-hidden
      className="absolute left-1/2 z-10 rounded-full border-2 border-current"
      style={{
        backgroundColor: markerColor,
        borderColor: markerColor,
        height: size,
        top: `${threshold * 100}%`,
        width: size,
        x: "-50%",
        y: "-50%",
        scale: markerScale,
      }}
    />
  );
}

export function ScrollProgressBar({
  targetRef,
  containerRef,
  progress,
  backgroundColor = "#dddddd",
  fillColor = "#770bf4",
  height = 206,
  width = 2,
  markerCount = 4,
  markerSize = 10,
  showMarkers = true,
  stiffness = 150,
  damping = 26,
  className,
  ariaLabel = "Section scroll progress",
}: ScrollProgressBarProps) {
  const prefersReducedMotion = useReducedMotion() === true;
  const { scrollYProgress } = useScroll(
    targetRef
      ? {
          container: containerRef,
          target: targetRef,
          offset: ["start start", "end end"],
        }
      : { container: containerRef },
  );
  const rawProgress = progress ?? scrollYProgress;
  const smoothProgress = useSpring(rawProgress, {
    stiffness,
    damping,
    mass: 0.22,
  });

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("relative", className)}
      style={{ height, width }}
    >
      <span
        aria-hidden
        className="absolute inset-0 overflow-hidden rounded-full"
        style={{ backgroundColor }}
      >
        <motion.span
          className="absolute inset-0 block origin-top rounded-full"
          style={{
            backgroundColor: fillColor,
            scaleY: prefersReducedMotion ? rawProgress : smoothProgress,
          }}
        />
      </span>
      {showMarkers &&
        Array.from({ length: Math.max(0, markerCount) }).map((_, index) => (
          <ProgressMarker
            key={index}
            index={index}
            total={markerCount}
            progress={prefersReducedMotion ? rawProgress : smoothProgress}
            fillColor={fillColor}
            backgroundColor={backgroundColor}
            size={markerSize}
          />
        ))}
    </div>
  );
}
