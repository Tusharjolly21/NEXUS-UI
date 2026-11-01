"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HardDriveIconProps = {
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

/** A hard drive whose platter spins up with its read arm sweeping round and its LED flickering. */
export function HardDriveIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HardDriveIconProps) {
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
      <rect x="2.8" y="5.5" width="18.4" height="13" rx="2.6" />
      <circle cx="9.4" cy="12" r="4" />
      <motion.g
        style={{ originX: "39%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 360] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M9.4 12v-1.8" stroke={accent} />
      </motion.g>
      <motion.path
        d="M17.3 9.5h.01"
        stroke={accent}
        strokeWidth={3}
        initial={false}
        animate={on ? { opacity: [1, 0.2, 1, 0.2, 1, 0.2, 1] } : { opacity: 1 }}
        transition={{ duration: 0.8 / speed }}
      />
      <path d="M17.3 14.5h.01" strokeWidth={3} />
    </svg>
  );
}
