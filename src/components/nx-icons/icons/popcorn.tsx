"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PopcornIconProps = {
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

/** Popcorn that pops up one puff after another while loose kernels hop and fall. */
export function PopcornIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PopcornIconProps) {
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
      <path d="M4.85 10.4L6.85 20H17.15L19.15 10.4z" />
      <path d="M9.62 10.4L10.28 20M14.38 10.4L13.72 20" stroke={accent} />
      <motion.g
        style={{ originX: "50%", originY: "43.33%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.12, 0.97, 1], scaleX: [1, 1.03, 1] } : { scaleY: 1, scaleX: 1 }}
        transition={{ duration: 0.5 / speed, delay: (0.1) / speed, times: [0, 0.4, 0.75, 1], ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M4.85 10.4A3 3 0 0 1 8.74 6.43A3.5 3.5 0 0 1 15.26 6.43A3 3 0 0 1 19.15 10.4" />
      </motion.g>
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.path
          d="M12 4.4h.01"
          stroke={accent}
          strokeWidth={2.6}
          initial={false}
          animate={on ? { y: [0, -2.2, 0], opacity: [0, 1, 0] } : { y: 0, opacity: 0 }}
          transition={{ duration: 0.55 / speed, delay: (0.1) / speed, times: [0, 0.45, 1], ease: "easeOut" }}
        />
        <motion.path
          d="M7.6 6.4h.01"
          stroke={accent}
          strokeWidth={2.6}
          initial={false}
          animate={on ? { y: [0, -2.2, 0], opacity: [0, 1, 0] } : { y: 0, opacity: 0 }}
          transition={{ duration: 0.55 / speed, delay: (0.24) / speed, times: [0, 0.45, 1], ease: "easeOut" }}
        />
        <motion.path
          d="M16.4 6.4h.01"
          stroke={accent}
          strokeWidth={2.6}
          initial={false}
          animate={on ? { y: [0, -2.2, 0], opacity: [0, 1, 0] } : { y: 0, opacity: 0 }}
          transition={{ duration: 0.55 / speed, delay: (0.38) / speed, times: [0, 0.45, 1], ease: "easeOut" }}
        />
      </svg>
    </svg>
  );
}
