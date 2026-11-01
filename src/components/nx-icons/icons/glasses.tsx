"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GlassesIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A pair of glasses that slide down the nose, get pushed back up and glint. */
export function GlassesIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GlassesIconProps) {
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
        initial={false}
        animate={on ? { y: [0, 1.6, -1.2, 0], rotate: [0, 0, -3, 0] } : { y: 0, rotate: 0 }}
        transition={{ duration: 0.7 / speed, times: [0, 0.3, 0.7, 1], ease: "easeInOut" }}
      >
        <circle cx="6.5" cy="14" r="4" />
        <circle cx="17.5" cy="14" r="4" />
        <path d="M10.5 13.2c.9-.8 2.1-.8 3 0" />
        <path d="M2.7 12.6 3.8 6.5M21.3 12.6 20.2 6.5" />
        <motion.path
          d="M4.9 12.4a1.8 1.8 0 0 1 1.3-1"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.3 / speed, delay: (on ? 0.3 : 0) / speed }}
        />
        <motion.path
          d="M15.9 12.4a1.8 1.8 0 0 1 1.3-1"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.3 / speed, delay: (on ? 0.4 : 0) / speed }}
        />
      </motion.g>
    </svg>
  );
}
