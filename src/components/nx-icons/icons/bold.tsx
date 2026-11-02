"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BoldIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff453a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A capital B whose stem and bowls fatten with a heavy pulse and settle back to normal weight. */
export function BoldIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BoldIconProps) {
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
        animate={on ? { strokeWidth: [strokeWidth, strokeWidth * 1.6, strokeWidth * 1.3, strokeWidth] } : { strokeWidth: strokeWidth }}
        transition={{ duration: 0.9 / speed, delay: (on ? 0.08 : 0) / speed, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
      >
        <path d="M6 4h6a3.5 3.5 0 0 1 0 7H6" />
        <path d="M6 11h7.5a4.5 4.5 0 0 1 0 9H6" />
      </motion.g>
      <motion.path
        d="M6 4v16"
        stroke={accent}
        initial={false}
        animate={on ? { strokeWidth: [strokeWidth, strokeWidth * 1.9, strokeWidth * 1.5, strokeWidth] } : { strokeWidth: strokeWidth }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
