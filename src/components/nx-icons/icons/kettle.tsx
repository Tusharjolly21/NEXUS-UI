"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type KettleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #38bdf8. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The kettle tips forward on its handle and pours a thin stream of water, then rocks back upright. */
export function KettleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: KettleIconProps) {
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
      <g transform="translate(1 -0.75)">

      <motion.path
        d="M3.03 12.48C2.83 15.08 2.53 16.88 2.23 21"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.3, 0.7, 0.9], ease: "easeInOut" }}
      />
      <motion.g
        style={{ originX: "50.83%", originY: "62.5%" }}
        initial={false}
        animate={on ? { rotate: [0, -17, -17, 0], x: [0, 1.0, 1.0, 0] } : { rotate: 0, x: 0 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.28, 0.7, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M6.12 12.4L6.28 11.26A1 1 0 0 1 7.27 10.4L14.95 10.4A1 1 0 0 1 15.93 11.24L17.07 18.42A1.8 1.8 0 0 1 15.29 20.5L7.07 20.5A1.8 1.8 0 0 1 5.28 18.45L5.57 16.4Q2.4 16.4 2 9.4L4.9 8.3Q3.9 12.4 6.12 12.4Z" />
        <path d="M7.6 10.4C7.6 5.8 14.6 5.8 14.6 10.4" />
        <path d="M11 6.95V5" />
        <path d="M16.05 12H18A2 2 0 0 1 20 14V16.4A2 2 0 0 1 18 18.4H17.07" />
      </motion.g>

      </g>
    </svg>
  );
}
