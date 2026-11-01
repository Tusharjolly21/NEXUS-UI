"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BusIconProps = {
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

/** A bus that bounces along its route, headlights flashing. */
export function BusIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BusIconProps) {
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
        animate={on ? { y: [0, -0.7, 0, -0.7, 0] } : { y: 0 }}
        transition={{ duration: 0.6 / speed, ease: "easeInOut" }}
      >
        <rect x="4" y="3.5" width="16" height="14" rx="2.6" />
        <path d="M4 10.5h16" />
        <motion.path
          d="M8 14.2h.01M16 14.2h.01"
          stroke={accent}
          strokeWidth={3}
          initial={false}
          animate={on ? { opacity: [0.3, 1, 0.3, 1] } : { opacity: 1 }}
          transition={{ duration: 0.6 / speed }}
        />
        <path d="M8 19.8h.01M16 19.8h.01" strokeWidth={3.4} />
      </motion.g>
    </svg>
  );
}
