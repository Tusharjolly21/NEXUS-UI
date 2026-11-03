"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type UserMinusIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff6482. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A person steps back as a minus slides in from the right and settles beside them. */
export function UserMinusIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: UserMinusIconProps) {
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
        animate={on ? { x: [0, -0.9, 0] } : { x: 0 }}
        transition={{ duration: 0.5 / speed, delay: (on ? 0.15 : 0) / speed, ease: "easeInOut" }}
      >
        <motion.circle
          cx="9"
          cy="8"
          r="3.4"
          initial={false}
          animate={on ? { y: [0, 1.2, 0] } : { y: 0 }}
          transition={{ duration: 0.4 / speed, ease: "easeInOut" }}
        />
        <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
      </motion.g>
      <motion.path
        d="M15.6 10.5H21"
        stroke={accent}
        initial={false}
        animate={on ? { x: [7, -0.8, 0], opacity: [0, 1, 1], pathLength: [0, 1, 1] } : { x: 0, opacity: 1, pathLength: 1 }}
        transition={{ duration: 0.5 / speed, delay: (on ? 0.1 : 0) / speed, times: [0, 0.7, 1], ease: "easeOut" }}
      />
    </svg>
  );
}
