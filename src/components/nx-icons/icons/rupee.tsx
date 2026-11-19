"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RupeeIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #af52de. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The rupee's leg kicks out and swings back on a spring while the two bars hold steady. */
export function RupeeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RupeeIconProps) {
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
      <g transform="translate(0 -0.21)">

      <motion.g
        style={{ originX: "31.67%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, -20, 9, -4, 1.5, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.26, 0.5, 0.68, 0.84, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M7.6 12L16 19.4" stroke={accent} />
      </motion.g>
      <path d="M6.6 5H17.4" />
      <path d="M6.6 8.5H17.4" />
      <path d="M10.6 5A3.5 3.5 0 0 1 10.6 12H7.6" />
      </g>
    </svg>
  );
}
