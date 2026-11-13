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
      <g transform="translate(1.33 -0.54)">

      <motion.path
        d="M2.82 12.08C2.62 14.68 2.32 16.48 2.02 21"
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
        <path d="M5.1 18.44A1.8 1.8 0 0 0 6.88 20.5L15.12 20.5A1.8 1.8 0 0 0 16.9 18.44L15.7 10.09A0.8 0.8 0 0 0 14.91 9.4L7.09 9.4A0.8 0.8 0 0 0 6.3 10.09Z" />
        <path d="M7.4 9.4C7.4 4.9 14.6 4.9 14.6 9.4" />
        <path d="M11 6.03V4.6" />
        <path d="M15.92 11.6H18A2 2 0 0 1 20 13.6V16.2A2 2 0 0 1 18 18.2H16.87" />
        <path d="M5.13 18.2Q1.4 13.89 1.4 8.6L5.2 8.6Q5.2 12.91 5.79 13.6" />
      </motion.g>

      </g>
    </svg>
  );
}
