"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GolfIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A golf ball that rolls down its mound across the green and drops into the hole while the flag flutters. */
export function GolfIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GolfIconProps) {
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
      <path d="M2.6 19.4H3.2C5.18 19.4 4.82 16.7 6.8 16.7C8.78 16.7 8.42 19.4 10.4 19.4H13.4A3.2 1.3 0 0 0 19.8 19.4H21.4" />
      <path d="M16.6 20.7V3.2" />
      <motion.path
        d="M16.6 3.2Q13.1 4.7 9.6 6.2Q13.1 7.7 16.6 9.2"
        initial={false}
        animate={on ? { d: ["M16.6 3.2Q13.1 4.7 9.6 6.2Q13.1 7.7 16.6 9.2", "M16.6 3.2Q13.75 3.4 10.5 5.6Q13.75 8.4 16.6 9.2", "M16.6 3.2Q12.55 6.05 8.9 6.9Q12.55 7.05 16.6 9.2", "M16.6 3.2Q13.45 3.93 10.1 5.85Q13.45 8.12 16.6 9.2", "M16.6 3.2Q13.1 4.7 9.6 6.2Q13.1 7.7 16.6 9.2"] } : { d: "M16.6 3.2Q13.1 4.7 9.6 6.2Q13.1 7.7 16.6 9.2" }}
        transition={{ duration: 0.7 / speed, delay: (0.62) / speed, ease: "easeInOut" }}
      />
      <svg x="0" y="0" width="24" height="19.4" viewBox="0 0 24 19.4" overflow="hidden">
        <motion.circle
          cx="6.8"
          cy="13.5"
          r="2.2"
          fill={accent}
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { x: [0, 3.99, 4.73, 3.6, 8.9, 8.9, 0, 0, 0], y: [0, 2.05, 3.2, 2.7, 2.7, 6.1, 0, 0, 0], scale: [1, 1, 1, 1, 1, 0.8, 0, 1.18, 1] } : { x: 0, y: 0, scale: 1 }}
          transition={{ duration: 1.3 / speed, times: [0, 0.08, 0.16, 0.23, 0.55, 0.65, 0.65, 0.84, 1], ease: ["linear", "linear", "linear", "easeOut", "easeIn", "linear", "easeOut", "easeInOut"] }}
        />
      </svg>
    </svg>
  );
}
