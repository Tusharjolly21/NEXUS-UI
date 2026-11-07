"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PlanetIconProps = {
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

/** A ringed planet that tilts on its axis while a small moon orbits around it. */
export function PlanetIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PlanetIconProps) {
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
        animate={on ? { rotate: [0, -16, 10, -5, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M17.79 15.06A6.4 6.4 0 0 1 10.16 18.46M6.28 15.21A6.4 6.4 0 1 1 17.96 10.01" />
        <path d="M7.87 10.83A4.4 4.4 0 0 1 10.5 8.2" stroke={accent} strokeWidth={1.4} />
        <path d="M16.35 7.64A10.1 3.1 -24 1 1 5.6 12.42" stroke={accent} />
      </motion.g>
      <motion.circle
        cx="5.84"
        cy="5.49"
        r="1.2"
        fill="currentColor"
        stroke="none"
        initial={false}
        animate={on ? { x: [0, 4.24, 9, 12.99, 15.15, 14.91, 12.31, 8.07, 3.31, -0.68, -2.84, -2.59, 0], y: [0, -2.16, -1.91, 0.68, 4.92, 9.68, 13.67, 15.84, 15.59, 12.99, 8.75, 3.99, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.9 / speed, ease: "linear" }}
      />
    </svg>
  );
}
