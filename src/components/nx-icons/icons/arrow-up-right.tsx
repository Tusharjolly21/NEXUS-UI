"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ArrowUpRightIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #32d74b. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An arrow that launches off to the upper right between two speed lines, then a fresh one slides in from the lower left. */
export function ArrowUpRightIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ArrowUpRightIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      overflow="visible"
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
      <motion.path
        d="M4 13L7 10"
        stroke={accent}
        strokeWidth={1.6}
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1, 0], x: [0, -2.5], y: [0, 2.5] } : { pathLength: 1, opacity: 0 }}
        transition={{ duration: 0.45 / speed, delay: (0.03) / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M11 20L14 17"
        stroke={accent}
        strokeWidth={1.6}
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1, 0], x: [0, -2.5], y: [0, 2.5] } : { pathLength: 1, opacity: 0 }}
        transition={{ duration: 0.45 / speed, delay: (0.08) / speed, ease: "easeOut" }}
      />
      <motion.g
        initial={false}
        animate={on ? { x: [0, 9, -9, 0], y: [0, -9, 9, 0], opacity: [1, 0, 0, 1] } : { x: 0, y: 0, opacity: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.4, 0.41, 0.85], ease: ["easeIn", "linear", "easeOut"] }}
      >
        <path d="M5.5 18.5L18.5 5.5" />
        <path d="M11.5 5.5L18.5 5.5L18.5 12.5" />
      </motion.g>
    </svg>
  );
}
