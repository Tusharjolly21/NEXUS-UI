"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HandsClappingIconProps = {
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

/** Two hands pivot from the wrists and clap together twice, throwing off a burst of sparks each time. */
export function HandsClappingIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HandsClappingIconProps) {
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
        style={{ originX: "77.21%", originY: "84.02%" }}
        initial={false}
        animate={on ? { rotate: [0, 9, 0, 9, 0, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.15, 0.32, 0.5, 0.66, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g transform="translate(12 11.58) rotate(-20)">
          <path d="M0 8.7V1.6A1.6 1.6 0 0 1 3.2 1.6V2.6A1.6 1.6 0 0 1 6.4 2.6V5.67L5.6 8.7A1.6 1.6 0 0 1 4.16 10.3H1.6A1.6 1.6 0 0 1 0 8.7" />
          <path d="M3.2 2.6V6.8M6.15 6.6L8.05 4.4" />
        </g>
      </motion.g>
      <motion.g
        style={{ originX: "22.79%", originY: "84.02%" }}
        initial={false}
        animate={on ? { rotate: [0, -9, 0, -9, 0, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.15, 0.32, 0.5, 0.66, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g transform="translate(12 11.58) scale(-1 1) rotate(-20)">
          <path d="M0 8.7V1.6A1.6 1.6 0 0 1 3.2 1.6V2.6A1.6 1.6 0 0 1 6.4 2.6V5.67L5.6 8.7A1.6 1.6 0 0 1 4.16 10.3H1.6A1.6 1.6 0 0 1 0 8.7" />
          <path d="M3.2 2.6V6.8M6.15 6.6L8.05 4.4" />
        </g>
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "36.58%" }}
        initial={false}
        animate={on ? { scale: [1, 0.7, 1.25, 0.8, 1.3, 1], opacity: [1, 0.3, 1, 0.3, 1, 1] } : { scale: 1, opacity: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.15, 0.32, 0.5, 0.66, 1], ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M9.86 6.98 7.71 5.18M12 5.98 12 3.18M14.14 6.98 16.29 5.18" stroke={accent} />
      </motion.g>
    </svg>
  );
}
