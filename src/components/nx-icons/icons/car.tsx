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

/** A car that shudders as the engine fires, flashes its headlights and lunges forward. */
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
      <g transform="translate(0 -0.75)">
      <motion.g
        initial={false}
        animate={on ? { x: [0, 0.5, -0.5, 0.5, -0.5, 0, 2, 0] } : { x: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.6, 1], ease: "easeInOut" }}
      >
        <path d="M12 5.2V10" stroke={accent} />
        <path d="M6.5 10 8.3 6.4A2 2 0 0 1 10.1 5.2h3.8a2 2 0 0 1 1.8 1.2L17.5 10" />
        <rect x="3" y="10" width="18" height="5.5" rx="2" />
        <path d="M5.6 12.8h.01M18.4 12.8h.01" stroke={accent} strokeWidth={2.4} />
        <circle cx="7.5" cy="18.8" r="1.6" />
        <circle cx="16.5" cy="18.8" r="1.6" />
      </motion.g>
      <motion.path
        d="M21.6 11.6l1.6-.8M21.6 14l1.6.8"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 1, 0, 1, 0.5] } : { opacity: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.35, 0.5, 0.6, 1] }}
      />
      </g>
    </svg>
  );
}
