"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BracesIconProps = {
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

/** The curly braces breathe apart while a cursor blinks twice between them, then they close back in. */
export function BracesIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BracesIconProps) {
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
        d="M9.5 3.5H9a3 3 0 0 0-3 3V9a3 3 0 0 1-3 3 3 3 0 0 1 3 3v2.5a3 3 0 0 0 3 3h.5"
        initial={false}
        animate={on ? { x: [0, -1.4, -1.4, 0] } : { x: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.25, 0.75, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M14.5 3.5H15a3 3 0 0 1 3 3V9a3 3 0 0 0 3 3 3 3 0 0 0-3 3v2.5a3 3 0 0 1-3 3h-.5"
        initial={false}
        animate={on ? { x: [0, 1.4, 1.4, 0] } : { x: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.25, 0.75, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M12 9.4v5.2"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 1, 1, 0, 0, 1, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.2, 0.4, 0.42, 0.55, 0.57, 0.8, 0.9] }}
      />
    </svg>
  );
}
