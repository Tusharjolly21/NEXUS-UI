"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HeartIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A heart that beats and fills in, for likes and favourites. */
export function HeartIcon({ size = 24, strokeWidth = 2, className, play }: HeartIconProps) {
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
      <motion.path
        d="M12 20.2C6.2 16 3.2 12.8 3.2 9.2A4.7 4.7 0 0 1 12 7.1a4.7 4.7 0 0 1 8.8 2.1c0 3.6-3 6.8-8.8 11z"
        initial={false}
        animate={on ? { scale: [1, 1.22, 0.94, 1.12, 1], fillOpacity: 1 } : { scale: 1, fillOpacity: 0 }}
        fill="currentColor"
        transition={{ scale: { duration: 0.7, ease: "easeInOut" }, fillOpacity: { duration: 0.25 } }}
      />
    </svg>
  );
}
