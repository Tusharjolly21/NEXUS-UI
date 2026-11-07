"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PaintBrushIconProps = {
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

/** A loaded paint brush that swings round from its handle and leaves a curved stroke of colour behind its tip. */
export function PaintBrushIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PaintBrushIconProps) {
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
        d="M15.45 20.14A16.4 16.4 0 0 1 6.13 15.5"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [1, 0.02, 0.02, 1] } : { pathLength: 1 }}
        transition={{ duration: 1.05 / speed, times: [0, 0.22, 0.28, 1], ease: ["easeInOut", "linear", "easeInOut"] }}
      />
      <motion.g
        style={{ originX: "73.88%", originY: "16.25%" }}
        initial={false}
        animate={on ? { rotate: [0, -37, -37, 0] } : { rotate: 0 }}
        transition={{ duration: 1.05 / speed, times: [0, 0.22, 0.28, 1], ease: ["easeInOut", "linear", "easeInOut"] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g transform="translate(17.73 3.9) rotate(45)">
          <path d="M-2.8 8.6C-2.8 12 -1.6 14 0 16.4 1.6 14 2.8 12 2.8 8.6z" fill={accent} />
          <rect x="-2.8" y="4.8" width="5.6" height="3.8" rx="1" />
          <path d="M0 0V4.8" />
        </g>
      </motion.g>
    </svg>
  );
}
