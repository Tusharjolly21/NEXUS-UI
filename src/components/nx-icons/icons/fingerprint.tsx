"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FingerprintIconProps = {
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

/** Ridges of a fingerprint pulse as a beam of light scans down across them. */
export function FingerprintIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FingerprintIconProps) {
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
        d="M3.5 12h17"
        stroke={accent}
        initial={false}
        animate={on ? { y: [-7, 7], opacity: [0, 1, 1, 0] } : { opacity: 0, y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.15, 0.85, 1], ease: "linear" }}
      />
      <motion.g
        initial={false}
        animate={on ? { opacity: [1, 0.55, 1, 0.55, 1] } : { opacity: 1 }}
        transition={{ duration: 0.9 / speed }}
      >
        <path d="M4.5 17.5v-5.5a7.5 7.5 0 0 1 15 0v2" />
        <path d="M8 19v-7a4 4 0 0 1 8 0v3.5" />
        <path d="M12 12.5v7" />
      </motion.g>
    </svg>
  );
}
