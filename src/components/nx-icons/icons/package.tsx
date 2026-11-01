"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PackageIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #c2763b. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A parcel whose lid pops up as tape rips off, then drops back with a thud. */
export function PackageIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PackageIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
      <motion.g
        initial={false}
        animate={on ? { y: [0, 0, -2, 0] } : { y: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.1, 0.3, 0.6], ease: "easeOut" }}
      >
        <path d="M12 3 20.5 7.5 12 12 3.5 7.5z" />
        <motion.path
          d="M7.8 5.2 16.3 9.8"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.3 / speed, delay: (on ? 0.1 : 0) / speed }}
        />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { y: [0, 0, 0.8, 0] } : { y: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.55, 0.65, 0.8] }}
      >
        <path d="M3.5 7.5v9L12 21v-9M20.5 7.5v9L12 21v-9" />
      </motion.g>
    </svg>
  );
}
