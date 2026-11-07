"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChartDonutIconProps = {
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

/** A donut chart whose three segments draw round in turn, the last one popping out with a flash of orange. */
export function ChartDonutIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ChartDonutIconProps) {
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
      <motion.path
        d="M13.66 4.17A8 8 0 0 1 15.76 19.06"
        initial={false}
        animate={on ? { pathLength: [0, 0, 1, 1], opacity: [0, 1, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={on ? { pathLength: { duration: 1.2 / speed, times: [0, 0, 0.3, 1], ease: "easeOut" }, opacity: { duration: 1.2 / speed, times: [0, 0.001, 0.002, 1] } } : { duration: 0.2 / speed }}
      />
      <motion.path
        d="M12.56 19.98A8 8 0 0 1 4.02 12.56"
        initial={false}
        animate={on ? { pathLength: [0, 0, 1, 1], opacity: [0, 0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={on ? { pathLength: { duration: 1.2 / speed, times: [0, 0.26, 0.5, 1], ease: "easeOut" }, opacity: { duration: 1.2 / speed, times: [0, 0.26, 0.27, 1] } } : { duration: 0.2 / speed }}
      />
      <motion.g
        initial={false}
        animate={on ? { x: [0, 0, -0.73, 0], y: [0, 0, -0.83, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 1.2 / speed, times: [0, 0.72, 0.86, 1], ease: "easeInOut" }}
      >
        <motion.path
          d="M4.48 9.26A8 8 0 0 1 10.34 4.17"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: [0, 0, 1, 1], opacity: [0, 0, 1, 1] } : { pathLength: 1, opacity: 1 }}
          transition={on ? { pathLength: { duration: 1.2 / speed, times: [0, 0.5, 0.74, 1], ease: "easeOut" }, opacity: { duration: 1.2 / speed, times: [0, 0.5, 0.51, 1] } } : { duration: 0.2 / speed }}
        />
      </motion.g>
    </svg>
  );
}
