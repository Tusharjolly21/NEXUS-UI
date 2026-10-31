"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CopyIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A second sheet that slides out from behind and ticks to say it is copied. */
export function CopyIcon({ size = 24, strokeWidth = 2, className, play }: CopyIconProps) {
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
      <path d="M15.5 8V5.5A1.5 1.5 0 0 0 14 4H5.5A1.5 1.5 0 0 0 4 5.5V14a1.5 1.5 0 0 0 1.5 1.5H8" />
      <motion.g
        initial={false}
        animate={on ? { x: [0, 1.2, 0], y: [0, 1.2, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <rect x="8.5" y="8.5" width="11.5" height="11.5" rx="1.8" />
        <motion.path
          d="M11.9 14.5l2 2 3.6-3.9"
          initial={false}
          animate={on ? { pathLength: [0, 1], opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 0.4, delay: on ? 0.2 : 0 }}
        />
      </motion.g>
    </svg>
  );
}
