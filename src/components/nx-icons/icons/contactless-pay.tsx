"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ContactlessPayIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A card taps forward while three payment waves light up one after the other. */
export function ContactlessPayIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ContactlessPayIconProps) {
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
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { y: [0, 1.2, 0], scale: [1, 1.04, 1] } : { y: 0, scale: 1 }} transition={{ duration: 0.5 / speed, times: [0, 0.4, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M6 5H18A3 3 0 0 1 21 8V16A3 3 0 0 1 18 19H6A3 3 0 0 1 3 16V8A3 3 0 0 1 6 5Z"  />
      <motion.path d="M9.3 10.5A3 3 0 0 1 9.3 13.5" stroke={accent} initial={false} animate={on ? { opacity: [1, 0.15, 1] } : { opacity: 1 }} transition={{ duration: 0.4 / speed, times: [0, 0.4, 1], ease: "easeInOut", delay: (0.2) / speed }} />
      <motion.path d="M11.55 9.2A5.6 5.6 0 0 1 11.55 14.8" stroke={accent} initial={false} animate={on ? { opacity: [1, 0.15, 1] } : { opacity: 1 }} transition={{ duration: 0.4 / speed, times: [0, 0.4, 1], ease: "easeInOut", delay: (0.35) / speed }} />
      <motion.path d="M13.8 7.9A8.2 8.2 0 0 1 13.8 16.1" stroke={accent} initial={false} animate={on ? { opacity: [1, 0.15, 1] } : { opacity: 1 }} transition={{ duration: 0.4 / speed, times: [0, 0.4, 1], ease: "easeInOut", delay: (0.5) / speed }} />
      </motion.g>
    </svg>
  );
}
