"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RadioIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff9f0a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A radio whose antenna sways while the dial is twisted through the stations and locks on. */
export function RadioIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RadioIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
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
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      aria-hidden="true"
    >
      <motion.path
        d="M16.5 8.5 19.8 3"
        stroke={accent}
        style={{ originX: "0%", originY: "100%" }}
        initial={false}
        animate={on ? { rotate: [0, -9, 6, -3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.7 / speed, ease: "easeInOut" }}
      />
      <rect x="3" y="8.5" width="18" height="12" rx="2.6" />
      <path d="M6 12.4v4M8 12v4.8M10 12.4v4" />
      <circle cx="15.8" cy="14.7" r="3" />
      <motion.g
        style={{ originX: "66%", originY: "61%" }}
        initial={false}
        animate={on ? { rotate: [0, 80, -50, 30, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="15.8" cy="13.6" r="0.8" fill={accent} stroke="none" />
      </motion.g>
    </svg>
  );
}
