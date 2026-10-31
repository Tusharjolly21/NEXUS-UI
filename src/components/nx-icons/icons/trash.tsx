"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TrashIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A bin whose lid flips open. */
export function TrashIcon({ size = 24, strokeWidth = 2, className, play }: TrashIconProps) {
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
        style={{ originX: "6%", originY: "100%" }}
        initial={false}
        animate={on ? { rotate: -12, y: -0.4 } : { rotate: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 16 }}
      >
        <path d="M4 6.5h16" />
        <path d="M9.5 6.5V4.2a.7.7 0 0 1 .7-.7h3.6a.7.7 0 0 1 .7.7v2.3" />
      </motion.g>
      <path d="M6 6.5l.9 12.3a2 2 0 0 0 2 1.8h6.2a2 2 0 0 0 2-1.8L18 6.5" />
      <path d="M10.2 10.5v6M13.8 10.5v6" />
    </svg>
  );
}
