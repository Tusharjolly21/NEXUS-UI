"use client";

import { motion, useReducedMotion } from "framer-motion";

export type ArcSpinnerIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Plays all the time. Pass false to hold it still. */
  play?: boolean;
};

/** A ring with an arc that grows and shrinks as it turns, the classic loading spinner. */
export function ArcSpinnerIcon({ size = 24, strokeWidth = 2, className, play }: ArcSpinnerIconProps) {
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
      <circle cx="12" cy="12" r="9" opacity="0.16" />
      <motion.circle
        cx="12"
        cy="12"
        r="9"
        initial={false}
        animate={on ? { rotate: 360, pathLength: [0.12, 0.6, 0.12] } : { rotate: 0, pathLength: 0.25 }}
        transition={
          on
            ? { rotate: { duration: 1.1, ease: "linear", repeat: Infinity }, pathLength: { duration: 1.7, ease: "easeInOut", repeat: Infinity } }
            : { duration: 0.3 }
        }
      />
    </svg>
  );
}
