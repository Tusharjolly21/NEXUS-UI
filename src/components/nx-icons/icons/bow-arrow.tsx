"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BowArrowIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The string is drawn back, the arrow is released and flies off the edge, and a fresh one slides into place. */
export function BowArrowIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BowArrowIconProps) {
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
      <g transform="translate(-1.26 0)">
      <svg x="1.26" y="0" width="24" height="24" viewBox="1.26 0 24 24" overflow="hidden">
        <motion.g
          initial={false}
          animate={on ? { x: [0, -2.7, -2.7, 24, 24, -24, 0] } : { x: 0 }}
          transition={{ duration: 1.4 / speed, times: [0, 0.3, 0.38, 0.5, 0.62, 0.64, 1], ease: ["easeInOut", "linear", "easeIn", "linear", "linear", "easeOut"] }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M5.5 12H19.4" stroke={accent} strokeLinecap="butt" />
          <path d="M18.4 10.2L21.4 12L18.4 13.8z" fill={accent} stroke={accent} strokeWidth={1.2} />
        </motion.g>
      </svg>
      <motion.path
        d="M5.5 3.5L5.5 12L5.5 20.5"
        initial={false}
        animate={on ? { d: ["M5.5 3.5L5.5 12L5.5 20.5", "M5.5 3.5L2.8 12L5.5 20.5", "M5.5 3.5L2.8 12L5.5 20.5", "M5.5 3.5L6.6 12L5.5 20.5", "M5.5 3.5L5 12L5.5 20.5", "M5.5 3.5L5.5 12L5.5 20.5", "M5.5 3.5L5.5 12L5.5 20.5"] } : { d: "M5.5 3.5L5.5 12L5.5 20.5" }}
        transition={{ duration: 1.4 / speed, times: [0, 0.3, 0.38, 0.42, 0.5, 0.6, 1], ease: "easeInOut" }}
        strokeWidth={strokeWidth * 0.75}
      />
      <path d="M5.5 3.5Q13.5 12 5.5 20.5" />
      </g>
    </svg>
  );
}
