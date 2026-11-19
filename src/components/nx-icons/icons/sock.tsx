"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SockIconProps = {
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

/** The striped sock swings on its peg like it hangs on a washing line, then comes to rest. */
export function SockIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SockIconProps) {
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
      <g transform="translate(-2.16 0.2)">

      <motion.g
        style={{ originX: "42.92%", originY: "12.5%" }}
        initial={false}
        animate={on ? { rotate: [0, 9, -7, 4, -1.5, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.2, 0.44, 0.66, 0.85, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M7 9.1H13.6M7 11.8H13.6" stroke={accent} />
        <path d="M7.9 3L12.7 3A0.9 0.9 0 0 1 13.6 3.9L13.6 12A2 2 0 0 0 15.6 14L18 14A3.3 3.3 0 0 1 18 20.6L11.6 20.6A4.6 4.6 0 0 1 7 16L7 3.9A0.9 0.9 0 0 1 7.9 3Z" />
        <path d="M7 6.4H13.6" />
      </motion.g>
      </g>
    </svg>
  );
}
