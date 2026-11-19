"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PeanutIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #c58b4c. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A peanut in its shell rattles from side to side while the nuts inside jiggle a beat behind. */
export function PeanutIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PeanutIconProps) {
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
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, -8, 7, -6, 4, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.14, 0.3, 0.46, 0.62, 0.8, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.g
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { x: [0, 0.35, -0.35, 0.3, -0.25, 0.1, 0] } : { x: 0 }}
          transition={{ duration: 0.8 / speed, times: [0, 0.2, 0.36, 0.52, 0.68, 0.86, 1], ease: "easeInOut" }}
        >
          <circle cx="7.24" cy="13.66" r="0.85" />
          <circle cx="10.45" cy="14.71" r="0.85" />
          <circle cx="7.94" cy="16.97" r="0.85" />
          <circle cx="16.76" cy="10.34" r="0.85" />
          <circle cx="13.55" cy="9.29" r="0.85" />
          <circle cx="16.06" cy="7.03" r="0.85" />
        </motion.g>
        <path d="M10.79 8.02A4.75 4.75 0 1 1 15.83 13.62A2.9 2.9 0 0 0 13.21 15.98A4.75 4.75 0 1 1 8.17 10.38A2.9 2.9 0 0 0 10.79 8.02Z" />
      </motion.g>
    </svg>
  );
}
