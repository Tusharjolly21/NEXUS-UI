"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SearchIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A magnifying glass that tilts as it looks, with a glint on the lens. */
export function SearchIcon({ size = 24, strokeWidth = 2, className, play }: SearchIconProps) {
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
        style={{ originX: "85%", originY: "85%" }}
        initial={false}
        animate={on ? { rotate: [0, -14, 10, -5, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M15.4 15.4 20.5 20.5" />
        <motion.path
          d="M7.6 9.4a3.2 3.2 0 0 1 2.2-2.2"
          strokeWidth={1.6}
          initial={false}
          animate={on ? { opacity: [0, 1, 1, 0] } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </motion.g>
    </svg>
  );
}
