"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HandPointingIconProps = {
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

/** A hand with its index finger raised: the finger taps down and a click ripple spreads from its tip. */
export function HandPointingIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HandPointingIconProps) {
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
      <g transform="translate(0.5 -0.75)">
      <motion.g
        initial={false}
        animate={on ? { y: [0, 0.9, 0] } : { y: 0 }}
        transition={{ duration: 0.5 / speed, ease: "easeInOut" }}
      >
        <path d="M8.4 13.4V5.4a1.95 1.95 0 0 1 3.9 0v5.1a1.5 1.5 0 0 1 2.95-.2 1.5 1.5 0 0 1 2.95.4v7.1c0 2.7-2 4.5-4.6 4.5h-1.6c-2 0-3.5-.8-4.6-2.3l-2.6-3.6a1.5 1.5 0 0 1 2.4-1.8z" />
      </motion.g>
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.circle
          cx="10.35"
          cy="3.2"
          r="1"
          stroke={accent}
          strokeWidth={1.6}
          initial={false}
          animate={on ? { r: [1, 4.5], opacity: [0.9, 0] } : { r: 1, opacity: 0 }}
          transition={on ? { duration: 0.5 / speed, delay: (0.25) / speed, ease: "easeOut" } : { duration: 0.1 / speed }}
        />
      </svg>
      </g>
    </svg>
  );
}
