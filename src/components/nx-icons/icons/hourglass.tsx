"use client";

import { motion, useReducedMotion } from "framer-motion";

export type HourglassIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Plays all the time. Pass false to hold it still. */
  play?: boolean;
};

/** An hourglass whose sand runs down, then flips over and starts again. */
export function HourglassIcon({ size = 24, strokeWidth = 2, className, play }: HourglassIconProps) {
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
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 0, 180] } : { rotate: 0 }}
        transition={on ? { duration: 3, times: [0, 0.86, 1], ease: "easeInOut", repeat: Infinity } : { duration: 0.3 }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M6 3h12M6 21h12" />
        <path d="M7.5 3v3.2c0 1.2.6 2.3 1.6 3L12 12l-2.9 2.8c-1 .7-1.6 1.8-1.6 3V21M16.5 3v3.2c0 1.2-.6 2.3-1.6 3L12 12l2.9 2.8c1 .7 1.6 1.8 1.6 3V21" />
        <motion.path
          d="M8.9 5.2h6.2L12 10z"
          fill="currentColor"
          stroke="none"
          style={{ originX: "50%", originY: "100%" }}
          initial={false}
          animate={on ? { scaleY: [1, 0, 0] } : { scaleY: 0.7 }}
          transition={on ? { duration: 3, times: [0, 0.8, 1], ease: "linear", repeat: Infinity } : { duration: 0.3 }}
        />
        <motion.path
          d="M15.1 18.8H8.9L12 14z"
          fill="currentColor"
          stroke="none"
          style={{ originX: "50%", originY: "100%" }}
          initial={false}
          animate={on ? { scaleY: [0, 1, 1] } : { scaleY: 0.4 }}
          transition={on ? { duration: 3, times: [0, 0.8, 1], ease: "linear", repeat: Infinity } : { duration: 0.3 }}
        />
        <motion.path
          d="M12 10.4V16"
          strokeWidth={1.3}
          initial={false}
          animate={on ? { opacity: [0, 1, 1, 0] } : { opacity: 0 }}
          transition={on ? { duration: 3, times: [0, 0.04, 0.78, 0.82], ease: "linear", repeat: Infinity } : { duration: 0.2 }}
        />
      </motion.g>
    </svg>
  );
}
