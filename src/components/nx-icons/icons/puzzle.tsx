"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PuzzleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A puzzle piece that slides in from the corner and clicks into place. */
export function PuzzleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PuzzleIconProps) {
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
      <g transform="translate(-1.5 2.0)">
      <motion.g
        initial={false}
        animate={on ? { x: [3, -0.6, 0], y: [-3, 0.5, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.5 / speed, times: [0, 0.7, 1], ease: "easeOut" }}
      >
        <path d="M5 9V6a2 2 0 0 1 2-2h3.2a2 2 0 1 1 3.6 0H17a2 2 0 0 1 2 2v3.2a2 2 0 1 1 0 3.6V17a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
        <motion.path
          d="M5 9V6a2 2 0 0 1 2-2h3.2"
          stroke={accent}
          initial={false}
          animate={on ? { opacity: [0, 0, 1] } : { opacity: 1 }}
          transition={{ duration: 0.5 / speed }}
        />
      </motion.g>
      </g>
    </svg>
  );
}
