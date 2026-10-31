"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HomeIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A house that hops and opens its door. */
export function HomeIcon({ size = 24, strokeWidth = 2, className, play }: HomeIconProps) {
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
        animate={on ? { y: [0, -2.6, 0] } : { y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10.2v9.3a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-9.3" />
        <motion.rect
          x="10"
          y="14.5"
          width="4"
          height="6"
          rx="0.8"
          style={{ originX: "0%", originY: "50%" }}
          initial={false}
          animate={on ? { scaleX: [1, 0.2, 0.2, 1] } : { scaleX: 1 }}
          transition={{ duration: 0.9, times: [0, 0.3, 0.7, 1], ease: "easeInOut" }}
        />
      </motion.g>
    </svg>
  );
}
