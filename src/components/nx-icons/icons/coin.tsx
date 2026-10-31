"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CoinIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A coin that flips over twice and lands. */
export function CoinIcon({ size = 24, strokeWidth = 2, className, play }: CoinIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleX: [1, 0.04, 1, 0.04, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="6.2" opacity="0.35" />
        <path d="M14.2 9.6c-.4-.8-1.2-1.2-2.2-1.2-1.3 0-2.2.7-2.2 1.7 0 2.3 4.6 1.2 4.6 3.6 0 1-1 1.8-2.4 1.8-1 0-1.9-.5-2.4-1.3M12 6.9v1.5M12 15.6v1.5" />
      </motion.g>
    </svg>
  );
}
