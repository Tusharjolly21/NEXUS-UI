"use client";

import { motion, useReducedMotion } from "framer-motion";

export type ClockIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Plays all the time. Pass false to hold it still. */
  play?: boolean;
};

/** A clock face whose hands sweep round at different speeds. */
export function ClockIcon({ size = 24, strokeWidth = 2, className, play }: ClockIconProps) {
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
      <circle cx="12" cy="12" r="9" />
      <motion.line
        x1="12"
        y1="12"
        x2="12"
        y2="7.4"
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { rotate: 360 } : { rotate: 120 }}
        transition={on ? { duration: 7.2, ease: "linear", repeat: Infinity } : { duration: 0.4 }}
      />
      <motion.line
        x1="12"
        y1="12"
        x2="12"
        y2="5.6"
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { rotate: 360 } : { rotate: 0 }}
        transition={on ? { duration: 1.8, ease: "linear", repeat: Infinity } : { duration: 0.4 }}
      />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
