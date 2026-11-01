"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ShuffleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff9f0a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Two arrows that redraw themselves crossing over each other, like cards being shuffled. */
export function ShuffleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ShuffleIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
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
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.55 / speed, ease: "easeOut" }}
      >
        <motion.path
          d="M3.5 7h3.2c3 0 4.6 2 6.2 5s3.2 5 6.2 5H21"
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.55 / speed, ease: "easeOut" }}
        />
        <motion.path
          d="M21 17l-2.5-2.5M21 17l-2.5 2.5"
          initial={false}
          animate={on ? { scale: [0, 1.3, 1] } : { scale: 1 }}
          style={{ originX: "100%", originY: "50%" }}
          transition={{ duration: 0.4 / speed, delay: (on ? 0.35 : 0) / speed }}
        />
      </motion.g>
      <motion.path
        d="M3.5 17h3.2c1.5 0 2.7-.5 3.7-1.5M13.6 8.4c1.1-.9 2.3-1.4 3.7-1.4H21"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.55 / speed, ease: "easeOut", delay: (on ? 0.1 : 0) / speed }}
      />
      <motion.path
        d="M21 7l-2.5-2.5M21 7l-2.5 2.5"
        stroke={accent}
        initial={false}
        animate={on ? { scale: [0, 1.3, 1] } : { scale: 1 }}
        style={{ originX: "100%", originY: "50%" }}
        transition={{ duration: 0.4 / speed, delay: (on ? 0.45 : 0) / speed }}
      />
    </svg>
  );
}
