"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SafeIconProps = {
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

/** The combination dial spins left, right and left again, the handle turns to open the lock and back, then the dial spins home. */
export function SafeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SafeIconProps) {
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
      <g transform="translate(0 -0.17)">

      <motion.g
        style={{ originX: "40%", originY: "46.25%" }}
        initial={false}
        animate={on ? { rotate: [0, 250, 110, 200, 200, 0] } : { rotate: 0 }}
        transition={{ duration: 1.3 / speed, times: [0, 0.22, 0.4, 0.55, 0.8, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M9.6 11.1V8" stroke={accent} />
      </motion.g>
      <circle cx="9.6" cy="11.1" r="3.1" />
      <motion.path
        d="M16.6 8.8V13.4"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 0, 45, 45, 0, 0] } : { rotate: 0 }}
        transition={{ duration: 1.3 / speed, times: [0, 0.56, 0.64, 0.72, 0.8, 1], ease: "easeInOut" }}
      />
      <path d="M3.4 5.4A2 2 0 0 1 5.4 3.4L18.6 3.4A2 2 0 0 1 20.6 5.4L20.6 16.8A2 2 0 0 1 18.6 18.8L5.4 18.8A2 2 0 0 1 3.4 16.8Z" />
      <path d="M6.6 18.8V21.0M17.4 18.8V21.0" />
      </g>
    </svg>
  );
}
