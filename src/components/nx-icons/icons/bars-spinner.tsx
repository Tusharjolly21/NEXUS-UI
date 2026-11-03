"use client";

import { motion, useReducedMotion } from "framer-motion";

export type BarsSpinnerIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays all the time. Pass false to hold it still. */
  play?: boolean;
};

/** Five equaliser bars that rise and fall one after another in a rolling wave, the middle bar in the accent colour. */
export function BarsSpinnerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BarsSpinnerIconProps) {
  const reduce = useReducedMotion();
  const on = !reduce && (play ?? true);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      overflow="visible"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {[4, 8, 12, 16, 20].map((x, i) => (
        <motion.line
          key={x}
          x1={x}
          x2={x}
          stroke={i === 2 ? accent : "currentColor"}
          initial={on ? { y1: 10, y2: 14 } : { y1: 12 - [3, 5, 7, 5, 3][i], y2: 12 + [3, 5, 7, 5, 3][i] }}
          animate={on ? { y1: [10, 4.5, 10], y2: [14, 19.5, 14] } : { y1: 12 - [3, 5, 7, 5, 3][i], y2: 12 + [3, 5, 7, 5, 3][i] }}
          transition={on ? { duration: 1.2 / speed, ease: "easeInOut", repeat: Infinity, delay: (i * 0.15) / speed } : { duration: 0.3 / speed }}
        />
      ))}
    </svg>
  );
}
