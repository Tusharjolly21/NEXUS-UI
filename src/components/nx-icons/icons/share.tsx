"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ShareIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An arrow that lifts out of a box, ready to be sent somewhere. */
export function ShareIcon({ size = 24, strokeWidth = 2, className, play }: ShareIconProps) {
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
        animate={on ? { y: [0, -2.4, 0] } : { y: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <path d="M12 14.5V3.5" />
        <path d="M8 7.5 12 3.5l4 4" />
      </motion.g>
      <path d="M8.5 10.5H6.5A1.5 1.5 0 0 0 5 12v7.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V12a1.5 1.5 0 0 0-1.5-1.5h-2" />
    </svg>
  );
}
