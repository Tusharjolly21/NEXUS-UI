"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LeafIconProps = {
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

/** A leaf that sways on its stem as its vein draws itself in. */
export function LeafIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LeafIconProps) {
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
      <g transform="translate(1.0 -1.0)">
      <motion.g
        style={{ originX: "22%", originY: "80%" }}
        initial={false}
        animate={on ? { rotate: [0, -10, 6, -3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M9.6 14.4 14.4 9.6"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.4 / speed, delay: (on ? 0.15 : 0) / speed }}
        />
        <path d="M5.5 18.5C5.5 10 10 5.5 18.5 5.5 18.5 14 14 18.5 5.5 18.5z" />
        <path d="M5.5 18.5 3.6 20.4" />
      </motion.g>
      </g>
    </svg>
  );
}
