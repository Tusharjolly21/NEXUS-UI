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
        <motion.path
          d="M12 13.6V16.6"
          stroke={accent}
          style={{ originX: "50%", originY: "0%" }}
          initial={false}
          animate={on ? { rotate: [0, 26, -20, 12, -5, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 / speed, delay: (0.2) / speed, ease: "easeInOut" }}
        />
        <path d="M6 19.4V12.3A5.4 5.4 0 0 1 11.4 6.9H12.6A5.4 5.4 0 0 1 18 12.3V19.4A1.8 1.8 0 0 1 16.2 21.2H7.8A1.8 1.8 0 0 1 6 19.4z" />
        <path d="M9.6 7.21V5.2a2.4 2.4 0 0 1 4.8 0V7.21" />
        <path d="M9 21.2V15.6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2V21.2" />
        <path d="M6 13.4H4.2a1.6 1.6 0 0 0 -1.6 1.6V17.4a1.6 1.6 0 0 0 1.6 1.6H6" />
        <path d="M18 13.4H19.8a1.6 1.6 0 0 1 1.6 1.6V17.4a1.6 1.6 0 0 1 -1.6 1.6H18" />
      </motion.g>
    </svg>
  );
}
