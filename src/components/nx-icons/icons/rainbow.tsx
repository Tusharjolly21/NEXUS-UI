"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RainbowIconProps = {
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

/** A rainbow that paints itself in, arc by arc, from the outside in. */
export function RainbowIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RainbowIconProps) {
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
      <g transform="translate(0 -1.5)">
      <motion.g
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scale: [0.92, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 0.6 / speed, times: [0, 0.7, 1], ease: "easeOut" }}
      >
        <motion.path
          d="M3 18a9 9 0 0 1 18 0"
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.45 / speed, ease: "easeOut" }}
        />
        <motion.path
          d="M6 18a6 6 0 0 1 12 0"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.45 / speed, delay: (on ? 0.14 : 0) / speed, ease: "easeOut" }}
        />
        <motion.path
          d="M9 18a3 3 0 0 1 6 0"
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.45 / speed, delay: (on ? 0.28 : 0) / speed, ease: "easeOut" }}
        />
      </motion.g>
      </g>
    </svg>
  );
}
