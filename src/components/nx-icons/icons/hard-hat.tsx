"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HardHatIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffd60a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A safety helmet that tips like a raised hat while a glint of light runs over its shell. */
export function HardHatIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HardHatIconProps) {
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
        style={{ originX: "50%", originY: "74.42%" }}
        initial={false}
        animate={on ? { rotate: [0, -15, -12, 3, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.28, 0.48, 0.78, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M5.2 17.86 V14.26 A6.8 6.8 0 0 1 10.1 7.73 M13.9 7.73 A6.8 6.8 0 0 1 18.8 14.26 V17.86" />
        <motion.path
          d="M10.1 17.86 V6.16 H13.9 V17.86"
          stroke={accent}
          initial={false}
          animate={on ? { strokeWidth: [strokeWidth, strokeWidth * 1.45, strokeWidth] } : { strokeWidth: strokeWidth }}
          transition={{ duration: 0.22 / speed, delay: (0.46) / speed }}
        />
        <path d="M2.6 17.86 H21.4" />
        <motion.path
          d="M5.2 17.86 V14.26 A6.8 6.8 0 0 1 10.1 7.73 V6.16 H13.9 V7.73 A6.8 6.8 0 0 1 18.8 14.26 V17.86"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: 0.16, pathOffset: [0, 0.84], opacity: [0, 1, 1, 0] } : { pathLength: 0.16, pathOffset: 0, opacity: 0 }}
          transition={{ duration: 0.55 / speed, delay: (0.3) / speed, ease: "easeInOut" }}
        />
      </motion.g>
    </svg>
  );
}
