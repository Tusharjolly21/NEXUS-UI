"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GitMergeIconProps = {
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

/** Two branches curve down from their nodes and join into one stem, and the merge node squeezes in with a click ring. */
export function GitMergeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GitMergeIconProps) {
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
        d="M5.5 7.5C5.5 12 12 10.5 12 16.5"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.5 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M18.5 7.5C18.5 12 12 10.5 12 16.5"
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.5 / speed, delay: (on ? 0.1 : 0) / speed, ease: "easeInOut" },
          opacity: { duration: 0.5 / speed, delay: (on ? 0.1 : 0) / speed, times: [0, 0.04, 1] },
        }}
      />
      <motion.circle
        cx="5.5"
        cy="5.5"
        r="2"
        stroke={accent}
        initial={false}
        animate={on ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.3 / speed }}
      />
      <motion.circle
        cx="18.5"
        cy="5.5"
        r="2"
        initial={false}
        animate={on ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.3 / speed, delay: (on ? 0.1 : 0) / speed }}
      />
      <motion.circle
        cx="12"
        cy="18.5"
        r="2"
        initial={false}
        animate={on ? { scale: [1, 1, 0.7, 1.28, 1] } : { scale: 1 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.85 / speed, times: [0, 0.5, 0.64, 0.8, 1], ease: "easeOut" }}
      />
      <motion.circle
        cx="12"
        cy="18.5"
        r="2"
        stroke={accent}
        initial={false}
        animate={on ? { scale: [1, 1, 2.2], opacity: [0, 0.9, 0] } : { scale: 1, opacity: 0 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.4 / speed, delay: (on ? 0.55 : 0) / speed, times: [0, 0.01, 1], ease: "easeOut" }}
      />
    </svg>
  );
}
