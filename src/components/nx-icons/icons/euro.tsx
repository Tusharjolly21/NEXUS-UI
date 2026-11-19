"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type EuroIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #2f6bff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The two bars pull back out of the C and shoot through it again one after the other, and the C kicks as they pass. */
export function EuroIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: EuroIconProps) {
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
      <g transform="translate(0.92 0)">

      <motion.g
        style={{ originX: "54%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 0, -9, 4, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.4, 0.58, 0.8, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M17.77 6.88A7 7 0 1 0 17.77 17.12" />
      </motion.g>
      <motion.path
        d="M4.4 10.1H13"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [1, 0, 1, 1], opacity: [1, 1, 0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.75 / speed, times: [0, 0.35, 0.7, 1], ease: "easeInOut" },
          opacity: { duration: 0.75 / speed, times: [0, 0.33, 0.35, 0.38, 1], ease: "linear" },
        }}
      />
      <motion.path
        d="M4.4 13.9H13"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [1, 1, 0, 1, 1], opacity: [1, 1, 0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.9 / speed, times: [0, 0.12, 0.42, 0.75, 1], ease: "easeInOut" },
          opacity: { duration: 0.9 / speed, times: [0, 0.4, 0.42, 0.45, 1], ease: "linear" },
        }}
      />
      </g>
    </svg>
  );
}
