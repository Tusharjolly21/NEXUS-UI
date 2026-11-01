"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChevronDownIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Two stacked chevrons that nod downwards one after the other, like a ripple. */
export function ChevronDownIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ChevronDownIconProps) {
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
        d="M6.5 6.5 12 12l5.5-5.5"
        initial={false}
        animate={on ? { y: [0, 2.5, 0] } : { y: 0 }}
        transition={{ duration: 0.4 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M6.5 12.5 12 18l5.5-5.5"
        stroke={accent}
        initial={false}
        animate={on ? { y: [0, 2.5, 0] } : { y: 0 }}
        transition={{ duration: 0.4 / speed, delay: (0.1) / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
