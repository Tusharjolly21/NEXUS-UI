"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BellIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A bell that swings back and forth, settling like it just rang. */
export function BellIcon({ size = 24, strokeWidth = 2, className, play }: BellIconProps) {
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
        style={{ originX: "50%", originY: "12%" }}
        initial={false}
        animate={on ? { rotate: [0, -18, 14, -9, 5, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 2H5z" />
        <path d="M10 21.2a2 2 0 0 0 4 0" />
      </motion.g>
    </svg>
  );
}
