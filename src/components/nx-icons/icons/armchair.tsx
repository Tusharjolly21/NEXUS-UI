"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ArmchairIconProps = {
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

/** An armchair whose cushion squashes down as if someone sat on it, then springs back as the whole chair settles. */
export function ArmchairIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ArmchairIconProps) {
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
      <path d="M5 16.5v4M19 16.5v4" />
      <motion.g
        initial={false}
        animate={on ? { y: [0, 0.7, -0.2, 0] } : { y: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
      >
        <path d="M7 17V6.5A3 3 0 0 1 10 3.5H14A3 3 0 0 1 17 6.5V17" />
        <path d="M3 17V13a2 2 0 0 1 4 0V17M17 17V13a2 2 0 0 1 4 0V17M3 17H21" />
        <motion.path
          d="M7 13.5h10V17H7z"
          stroke={accent}
          initial={false}
          animate={on ? { d: ["M7 13.5h10V17H7z", "M7 15.4h10V17H7z", "M7 13.2h10V17H7z", "M7 13.5h10V17H7z"] } : { d: "M7 13.5h10V17H7z" }}
          transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
        />
      </motion.g>
    </svg>
  );
}
