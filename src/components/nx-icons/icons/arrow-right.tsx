"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ArrowRightIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An arrow that shoots off to the right, leaving a trail, and slides back in from the left. */
export function ArrowRightIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ArrowRightIconProps) {
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
        d="M3 12h7"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 1, 0], x: [-2, 0, 2] } : { opacity: 0 }}
        transition={{ duration: 0.5 / speed, times: [0, 0.4, 1], delay: (0.05) / speed }}
      />
      <motion.g
        initial={false}
        animate={on ? { x: [0, 9, -9, 0], opacity: [1, 0, 0, 1] } : { x: 0, opacity: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.4, 0.41, 0.85], ease: "easeInOut" }}
      >
        <path d="M4.5 12h14.5" />
        <path d="M13.5 6.5 19 12l-5.5 5.5" />
      </motion.g>
    </svg>
  );
}
