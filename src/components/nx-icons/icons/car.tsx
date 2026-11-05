"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CarIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff3b30. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A car that shudders as the engine starts, flashes its headlight twice and lunges forward before settling back. */
export function CarIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CarIconProps) {
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
        animate={on ? { x: [0, 0.4, -0.4, 0.4, -0.4, 0, 1.1, 0], y: [0, -0.3, 0.2, -0.3, 0.2, 0, 0, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.62, 1], ease: "easeInOut" }}
      >
        <path d="M2.5 14.2V12.4c0-.6.4-1.1 1-1.2l3.7-.8 2.2-3c.4-.6 1-.9 1.7-.9h3.6c.7 0 1.3.3 1.7.8l2.5 3 1.6.4c.7.2 1.1.8 1.1 1.4v2.1" />
        <path d="M11.4 15.4h1.2" />
        <path d="M9.4 10.4h7.6" />
        <circle cx="6.8" cy="15.4" r="2" />
        <circle cx="17.2" cy="15.4" r="2" />
        <motion.path
          d="M19.3 12.9h.01"
          stroke={accent}
          strokeWidth={2.2}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1.7, 1, 1.7, 1], opacity: [1, 1, 0.55, 1, 1] } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.42, 0.55, 1] }}
        />
      </motion.g>
    </svg>
  );
}
