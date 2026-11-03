"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GitCommitIconProps = {
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

/** Two line ends run in, a commit node pops onto the line with a ripple, and a green tick draws above it. */
export function GitCommitIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GitCommitIconProps) {
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
        d="M3 12h5.3"
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.3 / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M21 12h-5.3"
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.3 / speed, ease: "easeOut" }}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="3.2"
        stroke={accent}
        initial={false}
        animate={on ? { scale: [0, 0, 1.3, 1] } : { scale: 1 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.75 / speed, times: [0, 0.3, 0.62, 1], ease: "easeOut" }}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="3.2"
        stroke={accent}
        initial={false}
        animate={on ? { scale: [1, 1, 2.3], opacity: [0, 0.8, 0] } : { scale: 1, opacity: 0 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.45 / speed, delay: (on ? 0.42 : 0) / speed, times: [0, 0.01, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M9.7 4.4l1.8 1.7 2.9-3.2"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 0, 1, 1], opacity: [0, 0, 1, 1, 0] } : { pathLength: 1, opacity: 0 }}
        transition={{
          pathLength: { duration: 1 / speed, times: [0, 0.5, 0.74, 1], ease: "easeOut" },
          opacity: { duration: 1 / speed, times: [0, 0.5, 0.52, 0.9, 1] },
        }}
      />
    </svg>
  );
}
