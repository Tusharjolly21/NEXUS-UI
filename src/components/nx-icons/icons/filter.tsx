"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FilterIconProps = {
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

/** A bar of colour inside the funnel narrows as it slides down the taper, drops through the stem, splashes flat on the end and fades while a fresh bar re-forms at the top. */
export function FilterIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FilterIconProps) {
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
      <g transform="translate(0 0)">
        <motion.line
          stroke={accent}
          strokeWidth={strokeWidth * 0.8}
          initial={false}
          animate={on
            ? { x1: [8.594, 11.99, 11.99, 11, 11, 11.99, 11.99, 8.594], x2: [15.406, 12.01, 12.01, 13, 13, 12.01, 12.01, 15.406], y1: [7.2, 11.654, 18.8, 18.8, 18.8, 7.2, 7.2, 7.2], y2: [7.2, 11.654, 18.8, 18.8, 18.8, 7.2, 7.2, 7.2], opacity: [1, 1, 1, 1, 0, 0, 1, 1] }
            : { x1: 8.594, x2: 15.406, y1: 7.2, y2: 7.2, opacity: 1 }}
          transition={{ duration: 1.0 / speed, times: [0, 0.4, 0.62, 0.7, 0.8, 0.81, 0.84, 1], ease: ["easeInOut", "easeIn", "easeOut", "linear", "linear", "linear", "easeOut"] }}
        />
        <path d="M3 4H21L14.5 12.5V20H9.5V12.5Z" />
      </g>
    </svg>
  );
}
