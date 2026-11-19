"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BeehiveIconProps = {
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

/** Two bees loop round the top of the straw hive and settle back beside it. */
export function BeehiveIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BeehiveIconProps) {
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
      <g transform="translate(-0.33 0.04)">

      <path d="M4.4 20.4Q3.57 18.8 4.55 17.2Q3.87 15.6 5 14Q4.52 12.4 5.84 10.8Q5.64 9.2 7.25 7.6C7.25 2.8 16.75 2.8 16.75 7.6Q18.36 9.2 18.16 10.8Q19.48 12.4 19 14Q20.13 15.6 19.45 17.2Q20.43 18.8 19.6 20.4Z" />
      <path d="M4.55 17.2H19.45M5 14H19M5.84 10.8H18.16M7.25 7.6H16.75" />
      <path d="M10.1 20.4A1.9 1.9 0 0 1 13.9 20.4Z" fill="currentColor" stroke="none" />
      <motion.circle
        cx="18.6"
        cy="3.6"
        r="1.05"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { x: [0, -3.64, -8.2, -10.99, -10.39, -6.75, -2.2, 0.6, 0], y: [0, -1.4, -1.1, 0.72, 3, 4.4, 4.1, 2.28, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 1 / speed, ease: "linear" }}
      />
      <motion.circle
        cx="20.6"
        cy="6.2"
        r="1.05"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { x: [0, -2.28, -5.64, -8.12, -8.27, -5.99, -2.63, -0.15, 0], y: [0, 2.03, 2.15, 0.29, -2.46, -4.49, -4.61, -2.75, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 1 / speed, ease: "linear" }}
      />

      </g>
    </svg>
  );
}
