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
        style={{ originX: "26.67%", originY: "74.17%" }}
        initial={false}
        animate={on ? { rotate: [0, 0, -11, 3, -1.2, 0] } : { rotate: 0 }}
        transition={{ duration: 1.2 / speed, times: [0, 0.46, 0.58, 0.72, 0.84, 1], ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M8.2 17.8L4.6 17.8L4.43 17.79L4.28 17.77L4.15 17.74L4.03 17.7L3.93 17.64L3.84 17.56L3.76 17.47L3.7 17.37L3.66 17.25L3.63 17.12L3.61 16.97L3.6 16.8L3.59 16.56L3.55 16.32L3.49 16.1L3.42 15.87L3.34 15.63L3.25 15.38L3.16 15.1L3.08 14.8L3.01 14.47L2.95 14.09L2.91 13.67L2.9 13.2L2.93 12.63L3.03 12.12L3.17 11.66L3.35 11.23L3.56 10.83L3.78 10.45L3.99 10.08L4.2 9.7L4.38 9.32L4.52 8.91L4.62 8.48L4.65 8L4.64 7.67L4.61 7.37L4.56 7.11L4.51 6.86L4.44 6.63L4.38 6.41L4.31 6.19L4.24 5.97L4.19 5.74L4.14 5.48L4.11 5.21L4.1 4.9L4.12 4.56L4.18 4.24L4.28 3.95L4.41 3.68L4.57 3.44L4.76 3.23L4.98 3.04L5.23 2.89L5.49 2.76L5.78 2.67L6.08 2.62L6.4 2.6L6.72 2.62L7.02 2.67L7.31 2.76L7.57 2.89L7.82 3.04L8.04 3.23L8.23 3.44L8.39 3.68L8.52 3.95L8.62 4.24L8.68 4.56L8.7 4.9L8.69 5.21L8.66 5.48L8.61 5.74L8.56 5.97L8.49 6.19L8.43 6.41L8.36 6.63L8.29 6.86L8.24 7.11L8.19 7.37L8.16 7.67L8.15 8L8.18 8.48L8.28 8.91L8.42 9.32L8.6 9.7L8.81 10.08L9.03 10.45L9.24 10.83L9.45 11.23" />
      </motion.g>
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.g
          initial={false}
          animate={on ? { x: [0, 8, 0, 0.5, 0, 0] } : { x: 0 }}
          transition={{ duration: 1.2 / speed, times: [0, 0.24, 0.46, 0.52, 0.64, 1], ease: ["easeInOut", "easeIn", "easeOut", "easeInOut", "linear"] }}
        >
          <motion.g
            style={{ originX: "67.5%", originY: "67.5%" }}
            initial={false}
            animate={on ? { rotate: [0, 180, 0, 12, 0, 0] } : { rotate: 0 }}
            transition={{ duration: 1.2 / speed, times: [0, 0.24, 0.46, 0.52, 0.64, 1], ease: ["easeInOut", "easeIn", "easeOut", "easeInOut", "linear"] }}
          >
            <rect width="24" height="24" fill="none" stroke="none" />
            <circle cx="16.2" cy="16.2" r="5.2" />
            <path d="M15.7 14.03h.01M17.15 16.54h.01M14.25 16.54h.01" stroke={accent} />
          </motion.g>
        </motion.g>
      </svg>
    </svg>
  );
}
