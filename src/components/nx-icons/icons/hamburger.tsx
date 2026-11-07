"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HamburgerIconProps = {
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

/** A burger whose bun, lettuce, patty and base lift apart one after another, then drop back into a stack. */
export function HamburgerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HamburgerIconProps) {
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
        initial={false}
        animate={on ? { y: [0, -1.8, -1.8, 0.35, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.52, 0.8, 1], ease: "easeInOut" }}
      >
        <path d="M3.5 9.2a8.5 6.2 0 0 1 17 0z" />
        <path d="M8.5 7.4h.01M12 5.9h.01M15.5 7.4h.01" stroke={accent} strokeWidth={1.8} />
      </motion.g>
      <motion.path
        d="M3.5 12.3q1.2143 1 2.4286 0t2.4286 0 2.4286 0 2.4286 0 2.4286 0 2.4286 0 2.4286 0"
        stroke={accent}
        initial={false}
        animate={on ? { y: [0, -0.8, -0.8, 0.25, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, delay: (0.07) / speed, times: [0, 0.3, 0.52, 0.8, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M4 15.4h16"
        initial={false}
        animate={on ? { y: [0, 0.3, 0.3, -0.1, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, delay: (0.14) / speed, times: [0, 0.3, 0.52, 0.8, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M3.5 18v1a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-1z"
        initial={false}
        animate={on ? { y: [0, 0.9, 0.9, -0.15, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, delay: (0.21) / speed, times: [0, 0.3, 0.52, 0.8, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
