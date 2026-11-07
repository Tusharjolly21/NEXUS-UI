"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HighlighterIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffd60a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A chisel tipped marker that glides along a line while a translucent highlight band draws itself in behind it. */
export function HighlighterIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HighlighterIconProps) {
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
      <motion.path
        d="M1.73 18.38H9.33"
        stroke={accent}
        strokeOpacity={0.42}
        strokeWidth={4.6}
        strokeLinecap="butt"
        initial={false}
        animate={on ? { pathLength: [1, 0, 0, 1] } : { pathLength: 1 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.2, 0.28, 1], ease: ["easeInOut", "linear", "easeInOut"] }}
      />
      <motion.g
        initial={false}
        animate={on ? { x: [0, -7.6, -7.6, 0] } : { x: 0 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.2, 0.28, 1], ease: ["easeInOut", "linear", "easeInOut"] }}
      >
        <g transform="translate(2.59 0.87) rotate(30 12 12)">
          <path d="M9.6 12.6H14.4L13.4 16.2L10.2 19.4z" fill={accent} />
          <rect x="8.4" y="3.6" width="7.2" height="9" rx="1.6" />
          <path d="M8.4 7.2H15.6" stroke={accent} />
        </g>
      </motion.g>
    </svg>
  );
}
