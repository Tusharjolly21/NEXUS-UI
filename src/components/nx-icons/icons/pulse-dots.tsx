"use client";

import { motion, useReducedMotion } from "framer-motion";

export type PulseDotsIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays all the time. Pass false to hold it still. */
  play?: boolean;
};

/** Three dots that swell and fade in sequence. */
export function PulseDotsIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PulseDotsIconProps) {
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
      {[5.5, 12, 18.5].map((cx, i) => (
        <motion.circle
          key={cx}
          cx={cx}
          cy="12"
          r="2.1"
          fill={i === 2 ? accent : "currentColor"}
          stroke="none"
          initial={{ scale: 0.55, opacity: 0.3 }}
          animate={on ? { scale: [0.55, 1, 0.55], opacity: [0.3, 1, 0.3] } : { scale: 1, opacity: 1 }}
          transition={on ? { duration: 1.1 / speed, ease: "easeInOut", repeat: Infinity, delay: (i * 0.18) / speed } : { duration: 0.2 / speed }}
        />
      ))}
    </svg>
  );
}
