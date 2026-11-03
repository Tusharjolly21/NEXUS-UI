"use client";

import { motion, useReducedMotion } from "framer-motion";

export type DualRingIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #64d2ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays all the time. Pass false to hold it still. */
  play?: boolean;
};

/** Two concentric rings with arcs that spin in opposite directions, the outer one in the accent colour and the inner one twice as fast. */
export function DualRingIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: DualRingIconProps) {
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
      <circle cx="12" cy="12" r="4.6" opacity="0.16" />
      <motion.circle
        cx="12"
        cy="12"
        r="9"
        stroke={accent}
        pathLength={1}
        strokeDasharray="0.2 0.3"
        initial={{ rotate: on ? 0 : -70 }}
        animate={on ? { rotate: [0, 360] } : { rotate: -70 }}
        transition={on ? { duration: 1.2 / speed, ease: "linear", repeat: Infinity } : { duration: 0.3 / speed }}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="4.6"
        pathLength={1}
        strokeDasharray="0.4 0.6"
        initial={{ rotate: on ? 0 : 150 }}
        animate={on ? { rotate: [0, -720] } : { rotate: 150 }}
        transition={on ? { duration: 1.2 / speed, ease: "linear", repeat: Infinity } : { duration: 0.3 / speed }}
      />
    </svg>
  );
}
