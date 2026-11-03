"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GitPullRequestIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The request arrow leaves its node, loops up and across, nudges into the base branch, and that node answers with a ring. */
export function GitPullRequestIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GitPullRequestIconProps) {
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
      <path d="M6 8v8" />
      <motion.circle
        cx="6"
        cy="18"
        r="2"
        initial={false}
        animate={on ? { scale: [1, 1.25, 1] } : { scale: 1 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.3 / speed }}
      />
      <motion.circle
        cx="18"
        cy="18"
        r="2"
        stroke={accent}
        initial={false}
        animate={on ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.3 / speed }}
      />
      <motion.path
        d="M18 16V9.5a3.5 3.5 0 0 0-3.5-3.5H12"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.5 / speed, delay: (on ? 0.1 : 0) / speed, ease: "easeInOut" },
          opacity: { duration: 0.5 / speed, delay: (on ? 0.1 : 0) / speed, times: [0, 0.04, 1] },
        }}
      />
      <motion.path
        d="M14.5 3.5 12 6l2.5 2.5"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 0, 1, 1], x: [3, 3, -1.4, 0] } : { opacity: 1, x: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.55, 0.78, 1], ease: "easeOut" }}
      />
      <motion.circle
        cx="6"
        cy="6"
        r="2"
        initial={false}
        animate={on ? { scale: [1, 1, 1.35, 1] } : { scale: 1 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.9 / speed, times: [0, 0.62, 0.8, 1], ease: "easeOut" }}
      />
      <motion.circle
        cx="6"
        cy="6"
        r="2"
        stroke={accent}
        initial={false}
        animate={on ? { scale: [1, 1, 2.2], opacity: [0, 0.9, 0] } : { scale: 1, opacity: 0 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.4 / speed, delay: (on ? 0.62 : 0) / speed, times: [0, 0.01, 1], ease: "easeOut" }}
      />
    </svg>
  );
}
