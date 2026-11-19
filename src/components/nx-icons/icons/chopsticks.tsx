"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChopsticksIconProps = {
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

/** A pair of chopsticks opens, pinches a little rice ball, lifts it up and sets it gently back down. */
export function ChopsticksIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ChopsticksIconProps) {
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
      <g transform="translate(-5.54 7.5)">

      <motion.g
        initial={false}
        animate={on ? { x: [0, 0, 0, 0.67, 0.67, 0, 0], y: [0, 0, 0, -0.99, -0.99, 0, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.18, 0.3, 0.52, 0.64, 0.84, 1], ease: "easeInOut" }}
      >
        <motion.g
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1, 0.92, 0.93, 0.93, 1, 1] } : { scale: 1 }}
          transition={{ duration: 1 / speed, times: [0, 0.27, 0.32, 0.52, 0.8, 0.9, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <circle cx="12" cy="12" r="2.3" fill={accent} stroke="none" />
        </motion.g>
        <motion.g
          style={{ originX: "74.42%", originY: "-16.97%" }}
          initial={false}
          animate={on ? { rotate: [0, 3, 0, 0, 0, 0] } : { rotate: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.16, 0.3, 0.8, 0.9, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M9.17 9.42L9.12 9.55L9.08 9.7L9.08 9.85L9.11 10L9.17 10.14L9.25 10.26L9.35 10.37L9.47 10.46L9.61 10.52L9.75 10.56L9.9 10.56L10.05 10.54L10.19 10.49L10.32 10.41L10.43 10.32L10.52 10.2L18.96 -3.39L19.08 -3.62L19.14 -3.87L19.16 -4.13L19.12 -4.39L19.03 -4.63L18.9 -4.85L18.72 -5.05L18.51 -5.2L18.27 -5.3L18.02 -5.36L17.76 -5.37L17.5 -5.32L17.26 -5.23L17.04 -5.08L16.86 -4.9L16.71 -4.69Z" fill="currentColor" stroke="none" />
        </motion.g>
        <motion.g
          style={{ originX: "102.94%", originY: "2.27%" }}
          initial={false}
          animate={on ? { rotate: [0, -3, 0, 0, 0, 0] } : { rotate: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.16, 0.3, 0.8, 0.9, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M14.23 12.69L14.15 12.82L14.1 12.96L14.08 13.11L14.08 13.26L14.12 13.41L14.18 13.54L14.27 13.67L14.38 13.77L14.5 13.85L14.64 13.9L14.79 13.93L14.94 13.93L15.08 13.9L15.22 13.84L15.35 13.76L15.45 13.65L25.7 1.38L25.85 1.16L25.95 0.92L26 0.67L26 0.41L25.95 0.15L25.84 -0.09L25.69 -0.3L25.51 -0.48L25.29 -0.62L25.04 -0.71L24.79 -0.75L24.53 -0.74L24.27 -0.68L24.04 -0.57L23.83 -0.41L23.66 -0.22Z" fill="currentColor" stroke="none" />
        </motion.g>
      </motion.g>

      </g>
    </svg>
  );
}
