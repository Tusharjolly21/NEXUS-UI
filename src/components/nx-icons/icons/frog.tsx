"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FrogIconProps = {
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

/** A frog that crouches and hops, then puffs its throat twice after it lands. */
export function FrogIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FrogIconProps) {
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
        style={{ originX: "50%", originY: "86.29%" }}
        initial={false}
        animate={on ? { y: [0, 0.6, -1.5, 0.4, 0, 0], scaleY: [1, 0.92, 1.03, 0.9, 1, 1] } : { y: 0, scaleY: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.14, 0.38, 0.55, 0.7, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M18.3 9.64A9.2 6.4 0 1 1 5.7 9.64M9.96 8.07A9.2 6.4 0 0 1 14.04 8.07" />
        <path d="M10.3 6.61a3.3 3.3 0 1 1 -6.6 0a3.3 3.3 0 1 1 6.6 0Z" />
        <path d="M20.3 6.61a3.3 3.3 0 1 1 -6.6 0a3.3 3.3 0 1 1 6.6 0Z" />
        <circle cx="7" cy="6.91" r="1" fill="currentColor" stroke="none" /><circle cx="17" cy="6.91" r="1" fill="currentColor" stroke="none" />
        <path d="M5.9 13.71Q12 18.71 18.1 13.71" strokeWidth={1.4} />
        <circle cx="10.5" cy="12.31" r="0.8" fill="currentColor" stroke="none" /><circle cx="13.5" cy="12.31" r="0.8" fill="currentColor" stroke="none" />
        <motion.g
          style={{ originX: "50%", originY: "63.38%" }}
          initial={false}
          animate={on ? { scaleX: [0, 1, 0.7, 1, 0], scaleY: [0, 1, 0.7, 1, 0] } : { scaleX: 0, scaleY: 0 }}
          transition={{ duration: 0.45 / speed, delay: (on ? 0.55 : 0) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M8.6 16.81a3.4 1.6 0 1 0 6.8 0a3.4 1.6 0 1 0 -6.8 0Z" stroke={accent} fill={accent} fillOpacity={0.22} strokeWidth={strokeWidth * 0.75} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
