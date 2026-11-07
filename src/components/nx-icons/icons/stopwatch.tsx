"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type StopwatchIconProps = {
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

/** A stopwatch whose top button clicks, the hand sweeps one full turn and the button clicks again to stop. */
export function StopwatchIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: StopwatchIconProps) {
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
      <circle cx="12" cy="13.4" r="8" />
      <path d="M12 5.4V2.6" />
      <motion.path
        d="M9.6 2.6h4.8"
        initial={false}
        animate={on ? { y: [0, 1.3, 0, 0, 0, 1.3, 0] } : { y: 0 }}
        transition={{ duration: 1.15 / speed, times: [0, 0.07, 0.15, 0.7, 0.8, 0.87, 0.95], ease: "easeInOut" }}
      />
      <path d="M17.66 7.74 19.35 6.05" />
      <path d="M12 8.3h.01M17.1 13.4h.01M12 18.5h.01M6.9 13.4h.01" />
      <motion.g
        style={{ originX: "50%", originY: "55.83%" }}
        initial={false}
        animate={on ? { rotate: [0, 360] } : { rotate: 360 }}
        transition={{ duration: 0.75 / speed, delay: (0.18) / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 13.4 15.62 10.57" stroke={accent} />
      </motion.g>
    </svg>
  );
}
