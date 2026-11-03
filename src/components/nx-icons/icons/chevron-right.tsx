"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChevronRightIconProps = {
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

/** A chevron that steps to the right, leaving a ghost of itself behind that fades away. */
export function ChevronRightIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ChevronRightIconProps) {
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
      <g transform="translate(-1.0 0)">
      <motion.path
        d="M4.5 5l7 7-7 7"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 0.8, 0], x: [0, 0, 1.5] } : { opacity: 0 }}
        transition={{ duration: 0.5 / speed, times: [0, 0.5, 1] }}
      />
      <motion.path
        d="M9.5 5l7 7-7 7"
        initial={false}
        animate={on ? { x: [0, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.5 / speed, times: [0, 0.5, 1], ease: ["easeOut", "easeInOut"] }}
      />
      </g>
    </svg>
  );
}
