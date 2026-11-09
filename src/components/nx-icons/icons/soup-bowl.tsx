"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SoupBowlIconProps = {
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

/** A bowl of soup whose steam curls while the spoon stirs. */
export function SoupBowlIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SoupBowlIconProps) {
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
      <path d="M3 12h18" />
      <path d="M4.4 12c0 5.4 3.4 8.9 7.6 8.9s7.6-3.5 7.6-8.9" />
      <motion.path
        d="M7.2 9.4c-1.1 -1.3 1.1 -2.6 0 -3.9s-1.1 -1.3 0 -2.6"
        stroke={accent}
        initial={false}
        animate={on ? { d: ["M7.2 9.4c-1.1 -1.3 1.1 -2.6 0 -3.9s-1.1 -1.3 0 -2.6", "M7.2 9.4c1.1 -1.3 -1.1 -2.6 0 -3.9s1.1 -1.3 0 -2.6", "M7.2 9.4c-1.1 -1.3 1.1 -2.6 0 -3.9s-1.1 -1.3 0 -2.6", "M7.2 9.4c1.1 -1.3 -1.1 -2.6 0 -3.9s1.1 -1.3 0 -2.6", "M7.2 9.4c-1.1 -1.3 1.1 -2.6 0 -3.9s-1.1 -1.3 0 -2.6"], y: [0, -0.9, 0] } : { d: "M7.2 9.4c-1.1 -1.3 1.1 -2.6 0 -3.9s-1.1 -1.3 0 -2.6", y: 0 }}
        transition={{ duration: 0.9 / speed, delay: (0) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M11 9.4c-1.1 -1.3 1.1 -2.6 0 -3.9s-1.1 -1.3 0 -2.6"
        stroke={accent}
        initial={false}
        animate={on ? { d: ["M11 9.4c-1.1 -1.3 1.1 -2.6 0 -3.9s-1.1 -1.3 0 -2.6", "M11 9.4c1.1 -1.3 -1.1 -2.6 0 -3.9s1.1 -1.3 0 -2.6", "M11 9.4c-1.1 -1.3 1.1 -2.6 0 -3.9s-1.1 -1.3 0 -2.6", "M11 9.4c1.1 -1.3 -1.1 -2.6 0 -3.9s1.1 -1.3 0 -2.6", "M11 9.4c-1.1 -1.3 1.1 -2.6 0 -3.9s-1.1 -1.3 0 -2.6"], y: [0, -0.9, 0] } : { d: "M11 9.4c-1.1 -1.3 1.1 -2.6 0 -3.9s-1.1 -1.3 0 -2.6", y: 0 }}
        transition={{ duration: 0.9 / speed, delay: (0.12) / speed, ease: "easeInOut" }}
      />
      <motion.g
        style={{ originX: "65.83%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, -11, 9, -7, 4, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M15.8 12L17.68 8.14" />
        <ellipse cx="18.82" cy="5.8" rx="1.9" ry="2.6" transform="rotate(26 18.82 5.8)" />
      </motion.g>
    </svg>
  );
}
