"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SigmaIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffd60a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The summation sign draws itself stroke by stroke while three dots count up beside it, then an accent sweep runs along it as the total. */
export function SigmaIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SigmaIconProps) {
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
        d="M18 7.5V4.5H6l6.5 7.5L6 19.5h12v-3"
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.55 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M18 7.5V4.5H6l6.5 7.5L6 19.5h12v-3"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1, 1], opacity: [0, 1, 0] } : { pathLength: 1, opacity: 0 }}
        transition={{ duration: 0.45 / speed, delay: (on ? 0.72 : 0) / speed, times: [0, 0.6, 1], ease: "easeInOut" }}
      />
      {[9.5, 12, 14.5].map((cy, i) => (
        <motion.circle
          key={cy}
          cx="16"
          cy={cy}
          r="1.1"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { scale: [0, 1.5, 1, 1, 0], opacity: [0, 1, 1, 1, 0] } : { scale: 0, opacity: 0 }}
          style={{ originX: "50%", originY: "50%" }}
          transition={{ duration: 0.62 / speed, delay: (on ? 0.38 + i * 0.1 : 0) / speed, times: [0, 0.24, 0.36, 0.78, 1] }}
        />
      ))}
    </svg>
  );
}
