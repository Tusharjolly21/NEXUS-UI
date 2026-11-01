"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MouseIconProps = {
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

/** A mouse that slides across the desk, scrolls its wheel and double-clicks. */
export function MouseIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MouseIconProps) {
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
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { x: [0, 2, -1.5, 0], rotate: [0, 8, -4, 0] } : { x: 0, rotate: 0 }}
        transition={{ duration: 0.5 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M7 11V7.8a5 5 0 0 1 5-5V11z"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { fillOpacity: [0, 0, 0.55, 0, 0.55, 0] } : { fillOpacity: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.55, 0.62, 0.75, 0.85, 1] }}
        />
        <rect x="7" y="2.8" width="10" height="18.4" rx="5" />
        <path d="M7 11h10M12 3.2v1.2" />
        <motion.path
          d="M12 6.8v1.8"
          stroke={accent}
          initial={false}
          animate={on ? { y: [0, -0.9, 0.9, 0] } : { y: 0 }}
          transition={{ duration: 0.4 / speed, delay: (0.1) / speed }}
        />
      </motion.g>
    </svg>
  );
}
