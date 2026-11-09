"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SnailIconProps = {
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

/** A snail that glides forward as its shell rocks and its eye stalks wiggle in turn. */
export function SnailIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SnailIconProps) {
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
        animate={on ? { x: [0, 0.7, 0.7, 0] } : { x: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.45, 0.6, 1], ease: "easeInOut" }}
      >
        <path d="M4.39 14.35C3.39 16.55 3.4 17.6 3.2 20L16.4 20C19.8 20 21.4 17.2 20.6 14.4C20 12.2 18.2 11.4 16.6 12.3Q15.7 12.9 14.75 12.52" />
        <motion.g
          style={{ originX: "76.81%", originY: "49.97%" }}
          initial={false}
          animate={on ? { rotate: [0, 9, -9, 9, -9, 0] } : { rotate: 0 }}
          transition={{ duration: 0.7 / speed, delay: (on ? 0.1 : 0) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M18.43 11.99Q17.83 9.35 17.4 6.7" stroke={accent} strokeWidth={1.5} />
          <circle cx="17.4" cy="6.7" r="1.15" fill={accent} stroke="none" />
        </motion.g>
        <motion.g
          style={{ originX: "84.27%", originY: "56.05%" }}
          initial={false}
          animate={on ? { rotate: [0, 9, -9, 9, -9, 0] } : { rotate: 0 }}
          transition={{ duration: 0.7 / speed, delay: (on ? 0.25 : 0) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M20.23 13.45Q19.77 10.48 20.7 7.5" stroke={accent} strokeWidth={1.5} />
          <circle cx="20.7" cy="7.5" r="1.15" fill={accent} stroke="none" />
        </motion.g>
        <motion.g
          style={{ originX: "37.5%", originY: "42.5%" }}
          initial={false}
          animate={on ? { rotate: [0, 6, 0] } : { rotate: 0 }}
          transition={{ duration: 1 / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M15.2 10.2A6.2 6.2 0 0 1 2.8 10.2A6.2 6.2 0 0 1 15.2 10.2Z" />
          <path d="M8.34 9.96C8.32 9.75 8.39 9.49 8.6 9.3C8.8 9.1 9.12 8.98 9.47 9.01C9.82 9.05 10.2 9.25 10.45 9.6C10.69 9.95 10.81 10.44 10.7 10.93C10.59 11.43 10.26 11.91 9.76 12.2C9.26 12.49 8.6 12.59 7.97 12.4C7.35 12.21 6.76 11.74 6.43 11.09C6.11 10.44 6.04 9.61 6.32 8.85C6.59 8.09 7.2 7.41 8.01 7.06C8.82 6.7 9.82 6.68 10.7 7.05C11.59 7.42 12.35 8.18 12.72 9.15C13.1 10.11 13.07 11.27 12.6 12.28" strokeWidth={strokeWidth * 0.75} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
