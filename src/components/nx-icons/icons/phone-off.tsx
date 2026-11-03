"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PhoneOffIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #a2845e. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A slash strikes across the handset and its two halves shudder, muted, either side of it. */
export function PhoneOffIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PhoneOffIconProps) {
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
        animate={on ? { x: [0, 0.8, -0.7, 0.5, 0], y: [0, 0.8, -0.7, 0.5, 0], opacity: [1, 0.45, 1, 0.65, 1] } : { x: 0, y: 0, opacity: 1 }}
        transition={{ duration: 0.7 / speed, delay: (on ? 0.25 : 0) / speed, ease: "easeInOut" }}
      >
        <path d="M5.05 15.31C3.8 13.11 3.5 10.75 5.09 9.16L8.2 6.05L10.32 8.17L7.21 11.28C6.94 11.55 7.11 12.13 7.53 12.83" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { x: [0, -0.8, 0.7, -0.5, 0], y: [0, -0.8, 0.7, -0.5, 0], opacity: [1, 0.45, 1, 0.65, 1] } : { x: 0, y: 0, opacity: 1 }}
        transition={{ duration: 0.7 / speed, delay: (on ? 0.25 : 0) / speed, ease: "easeInOut" }}
      >
        <path d="M11.69 17.16C12.61 17.8 13.39 18.12 13.72 17.79L16.83 14.68L18.95 16.8L15.84 19.91C14.13 21.62 11.52 21.15 9.19 19.65" />
      </motion.g>
      <motion.path
        d="M3.4 21.2 21 3.6"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.3 / speed, delay: (on ? 0.1 : 0) / speed, ease: "easeOut" },
          opacity: { duration: 0.3 / speed, delay: (on ? 0.1 : 0) / speed, times: [0, 0.1, 1] },
        }}
      />
    </svg>
  );
}
