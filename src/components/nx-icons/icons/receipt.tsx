"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ReceiptIconProps = {
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

/** A till receipt that prints its lines one at a time and stamps the total in colour. */
export function ReceiptIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ReceiptIconProps) {
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
      <motion.g
        initial={false}
        animate={on ? { y: [0, -1.2, 0] } : { y: 0 }}
        transition={{ duration: 0.4 / speed }}
      >
        <path d="M6.5 3h11v17.5l-1.83-1.3-1.84 1.3-1.83-1.3-1.84 1.3-1.83-1.3L6.5 20.5z" />
        <motion.path
          d="M9.5 8h5"
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.25 / speed, delay: (0.1) / speed }}
        />
        <motion.path
          d="M9.5 11.5h5"
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.25 / speed, delay: (0.28) / speed }}
        />
        <motion.path
          d="M9.5 15h2.2"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.2 / speed, delay: (0.46) / speed }}
        />
        <motion.path
          d="M14.5 15h.01"
          stroke={accent}
          strokeWidth={3}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [0, 1.6, 1] } : { scale: 1 }}
          transition={{ duration: 0.25 / speed, delay: (0.64) / speed }}
        />
      </motion.g>
    </svg>
  );
}
