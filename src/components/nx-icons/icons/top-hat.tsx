"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TopHatIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Two rabbit ears pop up out of the hat and wiggle one after the other. */
export function TopHatIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TopHatIconProps) {
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
      <g transform="translate(0 0.95)">
      <motion.g
        style={{ originX: "9.2px", originY: "7.11px" }}
        initial={false}
        animate={on ? { rotate: [0, -14, -3, -10, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, delay: (0.1) / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M7.7 7.46V4.1A1.5 1.5 0 0 1 10.7 4.1V6.76" stroke={accent} />
      </motion.g>
      <motion.g
        style={{ originX: "14.8px", originY: "7.11px" }}
        initial={false}
        animate={on ? { rotate: [0, 14, 3, 10, 2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, delay: (0.18) / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M13.3 6.76V4.1A1.5 1.5 0 0 1 16.3 4.1V7.46" stroke={accent} />
      </motion.g>
      <ellipse cx="12" cy="9" rx="5.8" ry="2.3" />
      <path d="M6.2 9L5.4 19.5M17.8 9L18.6 19.5" />
      <path d="M5.73 15.2Q12 17 18.27 15.2" strokeWidth={strokeWidth * 0.75} />
      <path d="M3 19.5H21" />
      </g>
    </svg>
  );
}
