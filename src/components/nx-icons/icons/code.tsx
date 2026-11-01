"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CodeIconProps = {
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

/** Code brackets that spread apart and snap back around a slash that writes itself in. */
export function CodeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CodeIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
        d="M8.5 7 3.5 12l5 5"
        initial={false}
        animate={on ? { x: [0, -2.4, 0] } : { x: 0 }}
        transition={{ duration: 0.6 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M15.5 7l5 5-5 5"
        initial={false}
        animate={on ? { x: [0, 2.4, 0] } : { x: 0 }}
        transition={{ duration: 0.6 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M13.5 5l-3 14"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.4 / speed, delay: (on ? 0.15 : 0) / speed, ease: "easeOut" }}
      />
    </svg>
  );
}
