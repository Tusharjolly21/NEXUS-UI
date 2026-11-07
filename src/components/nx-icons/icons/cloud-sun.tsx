"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CloudSunIconProps = {
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

/** A sun peeking from behind a cloud: its rays turn to and fro and the sun swells while the cloud drifts aside and back. */
export function CloudSunIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CloudSunIconProps) {
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
        style={{ originX: "60.83%", originY: "38.75%" }}
        initial={false}
        animate={on ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M11.9 9.38A2.7 2.7 0 1 1 15.89 11.67" stroke={accent} />
      </motion.g>
      <motion.g
        style={{ originX: "60.83%", originY: "38.75%" }}
        initial={false}
        animate={on ? { rotate: [0, -14, 10, -4, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M10.64 5.34 10 4.7M14.6 3.7V2.8M18.56 5.34 19.2 4.7M20.2 9.3H21.1M18.56 13.26 19.2 13.9" stroke={accent} />
      </motion.g>
      <motion.path
        d="M6.67 21.5a3.23 3.23 0 0 1 -0.42 -6.38A4.42 4.42 0 0 1 14.83 16.14a2.8 2.8 0 0 1 0.51 5.35z"
        initial={false}
        animate={on ? { x: [0, -1.1, 0] } : { x: 0 }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
