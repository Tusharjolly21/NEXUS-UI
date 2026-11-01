"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CloudIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #64d2ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A cloud that drifts upward and sways, a soft highlight drawing across it. */
export function CloudIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CloudIconProps) {
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
        initial={false}
        animate={on ? { y: [0, -2, 0], x: [0, 1.2, -0.8, 0], scale: [1, 1.05, 1] } : { y: 0, x: 0, scale: 1 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <path d="M7 18.5C4.8 18.5 3 16.8 3 14.6c0-2 1.5-3.6 3.4-4C7 7.4 9.2 5.5 12 5.5c2.8 0 5.1 1.9 5.6 4.6 2 .3 3.4 2 3.4 4 0 2.5-1.8 4.4-4.2 4.4z" />
        <motion.path
          d="M7.4 14.6a3.2 3.2 0 0 1 2.4-3.2"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.5 / speed, delay: (on ? 0.2 : 0) / speed }}
        />
      </motion.g>
    </svg>
  );
}
