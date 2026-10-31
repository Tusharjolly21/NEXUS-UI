"use client";

import { motion, useReducedMotion } from "framer-motion";

export type ClockIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff3b30. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays all the time. Pass false to hold it still. */
  play?: boolean;
};

/** A clock face whose hands sweep round at different speeds, the minute hand in the accent colour. */
export function ClockIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ClockIconProps) {
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
        transition={on ? { duration: 7.2 / speed, ease: "linear", repeat: Infinity } : { duration: 0.4 / speed }}
      />
      <motion.line
        x1="12"
        y1="12"
        x2="12"
        y2="5.6"
        stroke={accent}
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { rotate: 360 } : { rotate: 0 }}
        transition={on ? { duration: 1.8 / speed, ease: "linear", repeat: Infinity } : { duration: 0.4 / speed }}
      />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
