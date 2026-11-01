"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RepeatIconProps = {
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

/** Two arrows that pass each other in opposite directions, round a loop. */
export function RepeatIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RepeatIconProps) {
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
        animate={on ? { x: [0, 2, 0] } : { x: 0 }}
        transition={{ duration: 0.7 / speed, ease: "easeInOut" }}
      >
        <path d="M17 2.5l3.5 3.5L17 9.5" />
        <path d="M3.5 11V10a4 4 0 0 1 4-4h13" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { x: [0, -2, 0] } : { x: 0 }}
        transition={{ duration: 0.7 / speed, ease: "easeInOut" }}
      >
        <path d="M7 21.5 3.5 18 7 14.5" stroke={accent} />
        <path d="M20.5 13v1a4 4 0 0 1-4 4h-13" stroke={accent} />
      </motion.g>
    </svg>
  );
}
