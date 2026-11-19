"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type YarnBallIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff2d55. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The ball of wool rolls a little forward and back while its loose thread unspools and flicks. */
export function YarnBallIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: YarnBallIconProps) {
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
      <g transform="translate(-0.3 -0.4)">

      <motion.path
        d="M13.9 17.68C14.9 20.08 16.4 21 17.4 21S18.6 21 20.6 18.6"
        stroke={accent}
        initial={false}
        animate={on ? { d: ["M13.9 17.68C14.9 20.08 16.4 21 17.4 21S18.6 21 20.6 18.6", "M13.9 17.68C14.9 20.48 15.8 21 16.8 21S18.6 20.2 21 17.2", "M13.9 17.68C14.9 19.84 16.76 21 17.76 21S18.6 21.48 20.36 19.44", "M13.9 17.68C14.9 20.24 16.16 21 17.16 21S18.6 20.68 20.76 18.04", "M13.9 17.68C14.9 20.08 16.4 21 17.4 21S18.6 21 20.6 18.6"] } : { d: "M13.9 17.68C14.9 20.08 16.4 21 17.4 21S18.6 21 20.6 18.6" }}
        transition={{ duration: 0.95 / speed, times: [0, 0.3, 0.55, 0.78, 1], ease: "easeInOut" }}
      />
      <motion.g
        style={{ originX: "46.67%", originY: "45.83%" }}
        initial={false}
        animate={on ? { rotate: [0, 38, -12, 5, 0] } : { rotate: 0 }}
        transition={{ duration: 0.95 / speed, times: [0, 0.3, 0.55, 0.78, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="11.2" cy="11" r="7.2" />
        <path d="M11.22 3.8A8.6 8.6 0 0 1 4 11.02M14.53 4.62A12 12 0 0 1 4.82 14.33M17.36 7.27A15.4 15.4 0 0 1 7.47 17.16" />
      </motion.g>
      </g>
    </svg>
  );
}
