"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TicketIconProps = {
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

/** A ticket that tilts as its perforation dots pop one after another from top to bottom. */
export function TicketIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TicketIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, -6, 4, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M4.5 5.5H19.5A2 2 0 0 1 21.5 7.5V10A2 2 0 0 0 21.5 14V16.5A2 2 0 0 1 19.5 18.5H4.5A2 2 0 0 1 2.5 16.5V14A2 2 0 0 0 2.5 10V7.5A2 2 0 0 1 4.5 5.5Z" />
        <path d="M7.5 10.3H12.5" />
        <path d="M7.5 13.7H11" />
        <motion.path
          d="M16 8.5 h.01"
          stroke={accent}
          initial={false}
          animate={on ? { scale: [1, 1.7, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 / speed, delay: (on ? 0.12 : 0) / speed, ease: "easeInOut" }}
        />
        <motion.path
          d="M16 12 h.01"
          stroke={accent}
          initial={false}
          animate={on ? { scale: [1, 1.7, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 / speed, delay: (on ? 0.28 : 0) / speed, ease: "easeInOut" }}
        />
        <motion.path
          d="M16 15.5 h.01"
          stroke={accent}
          initial={false}
          animate={on ? { scale: [1, 1.7, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 / speed, delay: (on ? 0.44 : 0) / speed, ease: "easeInOut" }}
        />
      </motion.g>
    </svg>
  );
}
