"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GlueStickIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The glue stick twists up out of its tube with a wobble, waits, then winds back down. */
export function GlueStickIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GlueStickIconProps) {
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
      <g transform="translate(0 -0.48)">

      <motion.g
        style={{ originX: "50%", originY: "75%" }}
        initial={false}
        animate={on ? { rotate: [0, 0, 3, -3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.35, 0.5, 0.75, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M9 9V6L15 4.4V9"
          stroke={accent}
          initial={false}
          animate={on ? { d: ["M9 9V6L15 4.4V9", "M9 9V4.3L15 2.7V9", "M9 9V4.3L15 2.7V9", "M9 9V6L15 4.4V9"] } : { d: "M9 9V6L15 4.4V9" }}
          transition={{ duration: 0.9 / speed, times: [0, 0.35, 0.6, 1], ease: "easeInOut" }}
        />
        <path d="M8 9H16V19A1.5 1.5 0 0 1 14.5 20.5H9.5A1.5 1.5 0 0 1 8 19Z" />
        <path d="M8 12.5H16M10.5 16.5H13.5" />
      </motion.g>
      </g>
    </svg>
  );
}
