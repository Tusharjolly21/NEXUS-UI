"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LogInIconProps = {
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

/** An arrow that walks into an open doorway and the door glows as it passes through. */
export function LogInIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LogInIconProps) {
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
        d="M14 4h3.5A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5H14"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [1, 1, 0.35, 1] } : { opacity: 1 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.38, 0.5, 1] }}
      />
      <motion.g
        initial={false}
        animate={on ? { x: [0, 6, -6, 0], opacity: [1, 0, 0, 1] } : { x: 0, opacity: 1 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.4, 0.41, 0.85], ease: "easeInOut" }}
      >
        <path d="M3.5 12h9" />
        <path d="M9 8.5l3.5 3.5L9 15.5" />
      </motion.g>
    </svg>
  );
}
