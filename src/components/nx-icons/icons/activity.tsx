"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ActivityIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff2d55. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A heartbeat line that sweeps across from the left, then its tall spike beats twice. */
export function ActivityIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ActivityIconProps) {
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
        d="M2 12h4l1.6-3 1.6 3"
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.25 / speed, ease: "linear" }}
      />
      <motion.path
        d="M9.2 12l1.4 6.4 3-14 1.6 7.6"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1], d: ["M9.2 12l1.4 6.4 3-14 1.6 7.6", "M9.2 12l1.4 6.4 3-14 1.6 7.6", "M9.2 12l1.4 8.6 3-17.8 1.6 9.2", "M9.2 12l1.4 6.4 3-14 1.6 7.6", "M9.2 12l1.4 7.6 3-16 1.6 8.4", "M9.2 12l1.4 6.4 3-14 1.6 7.6"] } : { pathLength: 1, d: "M9.2 12l1.4 6.4 3-14 1.6 7.6" }}
        transition={{
          pathLength: { duration: 0.25 / speed, delay: (0.22) / speed, ease: "linear" },
          d: { duration: 1.1 / speed, times: [0, 0.57, 0.68, 0.78, 0.9, 1], ease: "easeOut" },
        }}
      />
      <motion.path
        d="M15.2 12H22"
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.2 / speed, delay: (on ? 0.42 : 0) / speed, ease: "linear" }}
      />
    </svg>
  );
}
