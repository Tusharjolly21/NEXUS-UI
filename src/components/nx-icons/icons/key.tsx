"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type KeyIconProps = {
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

/** A key that turns in a lock: a quarter turn, a click, and back. */
export function KeyIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: KeyIconProps) {
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
      <motion.g
        style={{ originX: "31%", originY: "65%" }}
        initial={false}
        animate={on ? { rotate: [0, -26, -26, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.4, 0.6, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M16.6 7.4l2.2 2.2M19.2 4.8l2 2" stroke={accent} />
        <path d="M11.2 12.6 20.4 3.4" />
        <circle cx="7.2" cy="16" r="5" />
      </motion.g>
    </svg>
  );
}
