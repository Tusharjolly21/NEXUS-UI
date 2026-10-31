"use client";

import { motion, useReducedMotion } from "framer-motion";

export type RippleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Plays all the time. Pass false to hold it still. */
  play?: boolean;
};

/** Rings that spread out from a dot and fade, one after the other. */
export function RippleIcon({ size = 24, strokeWidth = 2, className, play }: RippleIconProps) {
  const reduce = useReducedMotion();
  const on = !reduce && (play ?? true);
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
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      {[0, 1].map((i) => (
        <motion.circle
          key={i}
          cx="12"
          cy="12"
          initial={{ r: 2, opacity: 0 }}
          animate={on ? { r: [2, 10.5], opacity: [0.9, 0] } : { r: i ? 9 : 5.5, opacity: i ? 0.3 : 0.7 }}
          transition={on ? { duration: 1.8, ease: "easeOut", repeat: Infinity, delay: i * 0.9 } : { duration: 0.3 }}
        />
      ))}
    </svg>
  );
}
