"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type DumbbellIconProps = {
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

/** A dumbbell that is lifted overhead, held for a beat and set back down. */
export function DumbbellIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: DumbbellIconProps) {
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
        animate={on ? { y: [0, -3, -3, 0] } : { y: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.4, 0.6, 1], ease: "easeInOut" }}
      >
        <path d="M7 12h10" />
        <rect x="3.5" y="8" width="3.5" height="8" rx="1" stroke={accent} />
        <rect x="17" y="8" width="3.5" height="8" rx="1" stroke={accent} />
        <path d="M2 10.5v3M22 10.5v3" />
      </motion.g>
    </svg>
  );
}
