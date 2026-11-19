"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SkisIconProps = {
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

/** The pair of skis glides forward one ski after the other, like a skier's stride, and slides back into line. */
export function SkisIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SkisIconProps) {
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
      <g transform="translate(0.92 -0.42)">

      <motion.g
        initial={false}
        animate={on ? { x: [0, 1.15, 0, 0], y: [0, -0.61, 0, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
      >
        <path d="M8.12 13.49A0.6 0.6 0 0 0 8.93 13.74L10.88 12.7A0.6 0.6 0 0 0 11.12 11.89L10 9.77A0.6 0.6 0 0 0 9.19 9.53L7.24 10.56A0.6 0.6 0 0 0 7 11.37Z" fill={accent} stroke="none" />
        <path d="M2.53 15.11L16.3 7.78A2 2 0 0 0 17.31 5.57" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { x: [0, 0, 1.15, 0], y: [0, 0, -0.61, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.25, 0.55, 1], ease: "easeInOut" }}
      >
        <path d="M10.38 17.73A0.6 0.6 0 0 0 11.19 17.98L13.13 16.94A0.6 0.6 0 0 0 13.38 16.13L12.25 14.01A0.6 0.6 0 0 0 11.44 13.76L9.5 14.8A0.6 0.6 0 0 0 9.25 15.61Z" fill={accent} stroke="none" />
        <path d="M4.78 19.34L18.55 12.02A2 2 0 0 0 19.56 9.8" />
      </motion.g>

      </g>
    </svg>
  );
}
