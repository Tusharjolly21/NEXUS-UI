"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BackpackIconProps = {
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

/** A rucksack that bounces along as if it were being walked while its zip pull swings. */
export function BackpackIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BackpackIconProps) {
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
        style={{ originX: "50%", originY: "88.33%" }}
        initial={false}
        animate={on ? { y: [0, -1.4, 0, -0.7, 0], rotate: [0, -3, 0, 3, 0] } : { y: 0, rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M5.5 19.4 V12.3 A5.4 5.4 0 0 1 10.9 6.9 H13.1 A5.4 5.4 0 0 1 18.5 12.3 V19.4 A1.8 1.8 0 0 1 16.7 21.2 H7.3 A1.8 1.8 0 0 1 5.5 19.4 z" />
        <path d="M9.6 7.06 V5.2 a2.4 2.4 0 0 1 4.8 0 V7.06" />
        <path d="M8.2 21.2 V15.6 a2 2 0 0 1 2 -2 h3.6 a2 2 0 0 1 2 2 V21.2" />
        <path d="M5.58 11.4 C3.6 11.6 3.1 13 3.1 14.6 V17.8 C3.1 18.8 4.1 19.2 5.5 19.2" />
        <path d="M 18.42 11.4C 20.4 11.6 20.9 13 20.9 14.6V 17.8C 20.9 18.8 19.9 19.2 18.5 19.2" />
        <motion.path
          d="M12 13.6 v2.4"
          stroke={accent}
          style={{ originX: "50%", originY: "0%" }}
          initial={false}
          animate={on ? { rotate: [0, 26, -20, 12, -5, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 / speed, delay: (0.2) / speed, ease: "easeInOut" }}
        />
      </motion.g>
    </svg>
  );
}
