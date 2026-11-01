"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AtSignIconProps = {
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

/** An @ sign that spins a full turn, its centre pulsing like a signal. */
export function AtSignIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AtSignIconProps) {
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
        animate={on ? { rotate: [0, 360] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.circle
          cx="12"
          cy="12"
          r="3.4"
          stroke={accent}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1.25, 1, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.8 / speed }}
        />
        <path d="M15.5 12v1.3a2.2 2.2 0 0 0 4.4 0V12a8 8 0 1 0-3.2 6.4" />
      </motion.g>
    </svg>
  );
}
