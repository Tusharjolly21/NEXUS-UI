"use client";

import { motion, useReducedMotion } from "framer-motion";

export type ArcSpinnerIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays all the time. Pass false to hold it still. */
  play?: boolean;
};

/** A ring with an arc that grows and shrinks as it turns, the classic loading spinner. */
export function ArcSpinnerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ArcSpinnerIconProps) {
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
      <circle cx="12" cy="12" r="9" opacity="0.16" />
      <motion.circle
        cx="12"
        cy="12"
        r="9"
        stroke={accent}
        initial={false}
        animate={on ? { rotate: 360, pathLength: [0.12, 0.6, 0.12] } : { rotate: 0, pathLength: 0.25 }}
        transition={
          on
            ? { rotate: { duration: 1.1 / speed, ease: "linear", repeat: Infinity }, pathLength: { duration: 1.7 / speed, ease: "easeInOut", repeat: Infinity } }
            : { duration: 0.3 / speed }
        }
      />
    </svg>
  );
}
