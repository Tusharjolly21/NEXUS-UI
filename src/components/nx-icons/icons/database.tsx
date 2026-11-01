"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type DatabaseIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A database cylinder that squashes as a record is stored while its middle band lights up. */
export function DatabaseIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: DatabaseIconProps) {
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
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.08, 0.94, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.7 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M4.5 12a7.5 2.8 0 0 0 15 0"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.4 / speed, delay: (on ? 0.15 : 0) / speed }}
        />
        <ellipse cx="12" cy="6.3" rx="7.5" ry="2.8" />
        <path d="M4.5 6.3v11.4M19.5 6.3v11.4M4.5 17.7a7.5 2.8 0 0 0 15 0" />
      </motion.g>
    </svg>
  );
}
