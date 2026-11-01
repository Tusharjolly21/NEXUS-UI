"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SkipForwardIconProps = {
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

/** A skip button whose triangle lunges ahead with speed lines, the bar nudging after it. */
export function SkipForwardIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SkipForwardIconProps) {
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
        d="M2.6 9.5h2.6M2.6 14.5h2.6"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 1, 0], x: [2, 0, -1] } : { opacity: 0 }}
        transition={{ duration: 0.5 / speed, times: [0, 0.4, 1] }}
      />
      <motion.path
        d="M7 5.5l9 6.5-9 6.5z"
        fill="currentColor"
        initial={false}
        animate={on ? { x: [0, 3.2, 0] } : { x: 0 }}
        transition={{ duration: 0.5 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M19 5.5v13"
        stroke={accent}
        initial={false}
        animate={on ? { x: [0, 1.4, 0] } : { x: 0 }}
        transition={{ duration: 0.5 / speed, ease: "easeInOut", delay: (0.06) / speed }}
      />
    </svg>
  );
}
