"use client";

import { motion, useReducedMotion } from "framer-motion";

export type WaveDotsIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays all the time. Pass false to hold it still. */
  play?: boolean;
};

/** Three dots that bounce one after another in a rolling wave, the middle one in the accent colour. */
export function WaveDotsIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WaveDotsIconProps) {
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
      {[6, 12, 18].map((cx, i) => (
        <motion.circle
          key={cx}
          cx={cx}
          cy="13"
          r="1.9"
          fill={i === 1 ? accent : "currentColor"}
          stroke="none"
          initial={false}
          animate={on ? { y: [0, -5, 0, 0] } : { y: 0 }}
          transition={on ? { duration: 0.9 / speed, times: [0, 0.3, 0.6, 1], ease: "easeInOut", repeat: Infinity, delay: (i * 0.12) / speed } : { duration: 0.2 / speed }}
        />
      ))}
    </svg>
  );
}
