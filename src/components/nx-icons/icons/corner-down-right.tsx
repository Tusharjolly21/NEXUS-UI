"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CornerDownRightIconProps = {
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

/** A line that draws down and round the corner, then the arrowhead clicks in at the end with a small flash. */
export function CornerDownRightIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CornerDownRightIconProps) {
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
        d="M5.5 3.5V12.5a4 4 0 0 0 4 4H18.5"
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5 / speed, times: [0, 0.2, 1], ease: "easeInOut" }}
      />
      <motion.circle
        cx="18.5"
        cy="16.5"
        r="2"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [0.5, 0.5, 1.2, 1.6], opacity: [0, 0, 0.9, 0] } : { opacity: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.6, 0.7, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M14.5 12.5 18.5 16.5l-4 4"
        stroke={accent}
        initial={false}
        animate={on ? { x: [-3, -3, 1, 0], opacity: [0, 0, 1, 1] } : { x: 0, opacity: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.5, 0.8, 1], ease: "easeOut" }}
      />
    </svg>
  );
}
