"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BowlingBallIconProps = {
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

/** A bowling ball that rolls out of view, rolls back in and knocks the pin behind it so it tips over and wobbles upright. */
export function BowlingBallIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BowlingBallIconProps) {
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
        style={{ originX: "40.98%", originY: "74.17%" }}
        initial={false}
        animate={on ? { rotate: [0, 0, -11, 3, -1.2, 0] } : { rotate: 0 }}
        transition={{ duration: 1.2 / speed, times: [0, 0.46, 0.58, 0.72, 0.84, 1], ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M9.83 17.74L9.72 17.77L9.57 17.79L9.4 17.8L5.8 17.8L5.63 17.79L5.48 17.77L5.35 17.74L5.23 17.7L5.13 17.64L5.04 17.56L4.96 17.47L4.9 17.37L4.86 17.25L4.83 17.12L4.81 16.97L4.8 16.8L4.79 16.56L4.75 16.32L4.69 16.1L4.62 15.87L4.54 15.63L4.45 15.38L4.36 15.1L4.28 14.8L4.21 14.47L4.15 14.09L4.11 13.67L4.1 13.2L4.13 12.63L4.23 12.12L4.37 11.66L4.55 11.23L4.76 10.83L4.98 10.45L5.19 10.08L5.4 9.7L5.58 9.32L5.72 8.91L5.82 8.48L5.85 8L5.84 7.67L5.81 7.37L5.76 7.11L5.71 6.86L5.64 6.63L5.58 6.41L5.51 6.19L5.44 5.97L5.39 5.74L5.34 5.48L5.31 5.21L5.3 4.9L5.32 4.56L5.38 4.24L5.48 3.95L5.61 3.68L5.77 3.44L5.96 3.23L6.18 3.04L6.43 2.89L6.69 2.76L6.98 2.67L7.28 2.62L7.6 2.6L7.92 2.62L8.22 2.67L8.51 2.76L8.77 2.89L9.02 3.04L9.24 3.23L9.43 3.44L9.59 3.68L9.72 3.95L9.82 4.24L9.88 4.56L9.9 4.9L9.89 5.21L9.86 5.48L9.81 5.74L9.76 5.97L9.69 6.19L9.62 6.41L9.56 6.63L9.49 6.86L9.44 7.11L9.39 7.37L9.36 7.67L9.35 8L9.38 8.48L9.48 8.91L9.62 9.32L9.8 9.7L10.01 10.08L10.22 10.45L10.44 10.83L10.65 11.23L10.83 11.66L10.97 12.12L11.06 12.59" />
        <motion.path
          d="M11.06 12.59L11.07 12.63L11.1 13.2L11.09 13.67L11.05 14.09L10.99 14.47L10.92 14.8L10.84 15.1L10.75 15.38L10.66 15.63L10.58 15.87L10.51 16.1L10.45 16.32L10.41 16.56L10.4 16.8L10.39 16.97L10.37 17.12L10.34 17.25L10.3 17.37L10.24 17.47L10.16 17.56L10.07 17.64L9.97 17.7L9.85 17.74L9.83 17.74"
          initial={false}
          animate={on ? { opacity: [0, 0, 1, 1, 0, 0] } : { opacity: 0 }}
          transition={{ duration: 1.2 / speed, times: [0, 0.075, 0.117, 0.392, 0.425, 1], ease: "linear" }}
        />
      </motion.g>
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.g
          initial={false}
          animate={on ? { x: [0, 8, 0, 0.5, 0, 0] } : { x: 0 }}
          transition={{ duration: 1.2 / speed, times: [0, 0.24, 0.46, 0.52, 0.64, 1], ease: ["easeInOut", "easeIn", "easeOut", "easeInOut", "linear"] }}
        >
          <motion.g
            style={{ originX: "61.67%", originY: "67.5%" }}
            initial={false}
            animate={on ? { rotate: [0, 180, 0, 12, 0, 0] } : { rotate: 0 }}
            transition={{ duration: 1.2 / speed, times: [0, 0.24, 0.46, 0.52, 0.64, 1], ease: ["easeInOut", "easeIn", "easeOut", "easeInOut", "linear"] }}
          >
            <rect width="24" height="24" fill="none" stroke="none" />
            <circle cx="14.8" cy="16.2" r="5.2" />
            <path d="M14.3 14.03h.01M15.75 16.54h.01M12.85 16.54h.01" stroke={accent} />
          </motion.g>
        </motion.g>
      </svg>
    </svg>
  );
}
