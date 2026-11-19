"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RecycleIconProps = {
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

/** The three arrows chase each other round the loop in three quick steps, one full turn that lands exactly where it began. */
export function RecycleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RecycleIconProps) {
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
      <g transform="translate(0.04 0.67)">

      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 120, 120, 240, 240, 360], scale: [1, 0.94, 1, 0.94, 1, 1] } : { rotate: 0, scale: 1, transition: { duration: 0 / speed } }}
        transition={{ duration: 1 / speed, times: [0, 0.28, 0.36, 0.64, 0.72, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M8.01 7.91L9.75 4.9A2.6 2.6 0 0 1 14.25 4.9L15.99 7.91M16.4 5.59L15.99 7.91L13.78 7.1" stroke={accent} />
        <path d="M17.54 10.59L19.27 13.6A2.6 2.6 0 0 1 17.02 17.5L13.55 17.5M15.35 19.01L13.55 17.5L15.35 15.99" />
        <path d="M10.45 17.5L6.98 17.5A2.6 2.6 0 0 1 4.73 13.6L6.46 10.59M4.25 11.4L6.46 10.59L6.87 12.91" />
      </motion.g>
      </g>
    </svg>
  );
}
