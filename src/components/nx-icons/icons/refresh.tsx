"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RefreshIconProps = {
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

/** Two arrows chasing each other round a circle, turning half a turn on a spring and ratcheting into place. */
export function RefreshIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RefreshIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={{ rotate: on ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 120 * speed * speed, damping: 14 * speed }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M19.2 9.3A7.8 7.8 0 0 0 5.3 7.7" />
        <path d="M19.4 4.2v5.1h-5.1" />
        <path d="M4.8 14.7a7.8 7.8 0 0 0 13.9 1.6" stroke={accent} />
        <path d="M4.6 19.8v-5.1h5.1" stroke={accent} />
      </motion.g>
    </svg>
  );
}
