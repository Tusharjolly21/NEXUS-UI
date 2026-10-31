"use client";

import { motion, useReducedMotion } from "framer-motion";

export type TickSpinnerIconProps = {
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

/** Eight ticks that light up in turn and fade behind, like the activity indicator on a phone. The leading tick takes the accent colour. */
export function TickSpinnerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TickSpinnerIconProps) {
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
      {Array.from({ length: 8 }, (_, i) => (
        <motion.line
          key={i}
          x1="12"
          y1="3"
          x2="12"
          y2="7"
          stroke={i === 7 ? accent : "currentColor"}
          transform={`rotate(${i * 45} 12 12)`}
          initial={{ opacity: 0.18 }}
          animate={on ? { opacity: [1, 0.18] } : { opacity: 0.18 + i * 0.1 }}
          transition={on ? { duration: 0.9 / speed, ease: "linear", repeat: Infinity, delay: (i * 0.1125) / speed } : { duration: 0.3 / speed }}
        />
      ))}
    </svg>
  );
}
