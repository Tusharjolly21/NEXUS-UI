"use client";

import { motion, useReducedMotion } from "framer-motion";

export type OrbitIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff9f0a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays all the time. Pass false to hold it still. */
  play?: boolean;
};

/** A small dot that circles a ring around a beating centre. */
export function OrbitIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: OrbitIconProps) {
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
        animate={on ? { rotate: 360 } : { rotate: 0 }}
        transition={on ? { duration: 1.5 / speed, ease: "linear", repeat: Infinity } : { duration: 0.3 / speed }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="12" cy="12" r="8" opacity="0.2" />
        <circle cx="12" cy="4" r="2.1" fill={accent} stroke="none" />
      </motion.g>
      <motion.circle
        cx="12"
        cy="12"
        r="2.3"
        fill="currentColor"
        stroke="none"
        initial={false}
        animate={on ? { scale: [1, 0.65, 1] } : { scale: 1 }}
        transition={on ? { duration: 1.5 / speed, ease: "easeInOut", repeat: Infinity } : { duration: 0.2 / speed }}
      />
    </svg>
  );
}
