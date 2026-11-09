"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BulldozerIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffd60a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A bulldozer that lowers its blade, shoves forward and pushes up a little pile of earth. */
export function BulldozerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BulldozerIconProps) {
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
        animate={on ? { x: [0, 0, 0.8, 0] } : { x: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.3, 0.7, 1], ease: "easeInOut" }}
      >
        <path d="M6.7 13.1V6.7a1.2 1.2 0 0 1 1.2-1.2H10.7a1.2 1.2 0 0 1 1.2 1.2V9.5H14.9V13.1" />
        <rect x="8" y="7.5" width="2.8" height="2.6" rx="0.6" fill="currentColor" stroke="none" />
        <rect x="4" y="13.1" width="13.6" height="5.4" rx="2.7" />
        <path d="M6.7 15.8h.01M10.8 15.8h.01M14.9 15.8h.01" strokeWidth={1.8} />
        <motion.g
          style={{ originX: "62.08%", originY: "47.5%" }}
          initial={false}
          animate={on ? { rotate: [0, 11, 11, 0] } : { rotate: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.3, 0.7, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M14.9 11.4H19M19 8.4Q21 12.9 19 17.4" stroke={accent} />
        </motion.g>
      </motion.g>
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.path
          d="M21.6 19.4Q22.7 14.2 23.8 19.4Z"
          fill="currentColor"
          stroke="none"
          style={{ originX: "94.58%", originY: "80.83%" }}
          initial={false}
          animate={on ? { scale: [0.2, 0.2, 1, 1, 0.2], opacity: [0, 1, 1, 1, 0] } : { opacity: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.3, 0.7, 0.85, 1] }}
        />
      </svg>
    </svg>
  );
}
