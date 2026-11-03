"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FeatherIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A feather that drifts down on the air, swaying from side to side as its quill draws in. */
export function FeatherIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FeatherIconProps) {
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
      <g transform="translate(0.75 -1.0)">
      <motion.g
        style={{ originX: "75%", originY: "20%" }}
        initial={false}
        animate={on ? { rotate: [0, -12, 10, -5, 0], y: [0, 2.4, 0.8, 3, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 1.1 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M7.6 18 14.4 11"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.5 / speed, delay: (on ? 0.1 : 0) / speed }}
        />
        <path d="M19 4.6C11.8 4.2 6.6 8.6 6 15.6L5.5 19.8l4-.6C16.2 18.4 19.6 12 19 4.6z" />
        <path d="M5.5 19.8 3.6 21.4" />
      </motion.g>
      </g>
    </svg>
  );
}
