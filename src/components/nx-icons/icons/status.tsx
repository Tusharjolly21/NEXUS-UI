"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type StatusState = "idle" | "loading" | "success" | "error";

export type StatusIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the progress ring, the tick and the cross. Defaults to the icon's own colour. */
  accent?: string;
  /** Which state to show. Left out, it runs loading then success while the pointer is over it. */
  state?: StatusState;
  /** With no state set: true runs the sequence, false rests. Left out, it follows the pointer. */
  play?: boolean;
};

/** One icon that morphs between idle, loading, success and error: a ring that spins, fills in and ticks (or crosses out and shakes). */
export function StatusIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", state, play }: StatusIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const auto = state === undefined && !reduce && (play ?? hover);
  const mode: StatusState = state ?? "idle";
  const T = 2.4 / speed;

  // the ring: a track, and an arc that spins while loading and closes when it is done
  // (a zero-length line still draws a dot with round ends, so every part fades out when it is not in use)
  const ring = auto
    ? { pathLength: [0, 0.28, 0.28, 1], rotate: [0, 120, 600, 720], opacity: [0, 1, 1, 1] }
    : mode === "loading"
      ? { pathLength: 0.28, rotate: 360, opacity: 1 }
      : mode === "success" || mode === "error"
        ? { pathLength: 1, rotate: 0, opacity: 1 }
        : { pathLength: 0, rotate: 0, opacity: 0 };
  const ringTransition = auto
    ? { duration: T, times: [0, 0.05, 0.5, 0.64], ease: "easeInOut" as const }
    : mode === "loading"
      ? { rotate: { duration: 0.9 / speed, ease: "linear" as const, repeat: Infinity }, pathLength: { duration: 0.3 / speed } }
      : { duration: 0.45 / speed, ease: "easeOut" as const };
  const tick = auto ? { pathLength: [0, 0, 1], opacity: [0, 0, 1] } : { pathLength: mode === "success" ? 1 : 0, opacity: mode === "success" ? 1 : 0 };
  const tickTransition = auto ? { duration: T, times: [0, 0.62, 0.8] } : { duration: 0.35 / speed, delay: mode === "success" ? 0.2 / speed : 0 };
  const cross = { pathLength: !auto && mode === "error" ? 1 : 0, opacity: !auto && mode === "error" ? 1 : 0 };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      aria-hidden="true"
    >
      <motion.g
        initial={false}
        animate={mode === "error" && state ? { x: [0, -1.6, 1.6, -1, 0.6, 0] } : { x: 0 }}
        transition={{ duration: 0.5 / speed, delay: 0.25 / speed }}
      >
        <circle cx="12" cy="12" r="9" opacity="0.18" />
        <motion.circle cx="12" cy="12" r="9" stroke={accent} initial={false} animate={ring} transition={ringTransition} />
        <motion.path d="M8 12.4l2.7 2.7 5.3-5.6" stroke={accent} initial={false} animate={tick} transition={tickTransition} />
        <motion.path d="M9 9l6 6M15 9l-6 6" stroke={accent} initial={false} animate={cross} transition={{ duration: 0.3 / speed, delay: 0.3 / speed }} />
      </motion.g>
    </svg>
  );
}
