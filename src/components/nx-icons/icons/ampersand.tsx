"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AmpersandIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff6b3d. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The ampersand rewinds and writes itself again in one stroke, the coloured tail swooping out last. */
export function AmpersandIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AmpersandIconProps) {
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
      <g transform="translate(-0.29 -0.08)">

      <motion.path
        d="M8.65 9.33L18.7 19.7"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [1, 0, 0, 1, 1], opacity: [1, 1, 0, 0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 1 / speed, times: [0, 0.1, 0.66, 0.84, 1], ease: "easeInOut" },
          opacity: { duration: 1 / speed, times: [0, 0.09, 0.1, 0.68, 0.7, 1], ease: "linear" },
        }}
      />
      <motion.path
        d="M16.51 13.71L14.07 17.61A4.45 4.45 0 1 1 8.8 11.06L11.66 10.03A2.85 2.85 0 1 0 8.65 9.33"
        initial={false}
        animate={on ? { pathLength: [1, 1, 0, 0, 1, 1], opacity: [1, 1, 0, 0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 1 / speed, times: [0, 0.1, 0.26, 0.29, 0.66, 1], ease: "easeInOut" },
          opacity: { duration: 1 / speed, times: [0, 0.25, 0.26, 0.31, 0.33, 1], ease: "linear" },
        }}
      />
      </g>
    </svg>
  );
}
