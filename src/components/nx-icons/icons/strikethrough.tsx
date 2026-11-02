"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type StrikethroughIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A letter S that dims as a line is struck straight through it from left to right, then brightens again. */
export function StrikethroughIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: StrikethroughIconProps) {
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
        d="M16.5 7.5C16 5 14.2 3.5 12 3.5 9.4 3.5 7.5 5.2 7.5 7.4 7.5 9.6 9.2 10.6 12 12 14.8 13.4 16.5 14.4 16.5 16.6 16.5 18.8 14.6 20.5 12 20.5 9.8 20.5 8 19 7.5 16.5"
        initial={false}
        animate={on ? { opacity: [1, 1, 0.45, 0.45, 1] } : { opacity: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.15, 0.5, 0.8, 1] }}
      />
      <motion.path
        d="M3.5 12h17"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.4 / speed, delay: (on ? 0.15 : 0) / speed, ease: "easeOut" }}
      />
    </svg>
  );
}
