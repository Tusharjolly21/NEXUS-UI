"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HandWavingIconProps = {
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

/** An open hand that waves side to side from the wrist while its two motion arcs fade out and swish back in. */
export function HandWavingIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HandWavingIconProps) {
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
        style={{ originX: "50%", originY: "89.17%" }}
        initial={false}
        animate={on ? { rotate: [0, 11, -11, 9, -8, 4, 0] } : { rotate: 0 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.14, 0.36, 0.56, 0.74, 0.88, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M8.5 21.4V19.8C8.5 18.2 8.14 17.89 6.15 16.22L3.09 13.65A1.5 1.5 0 0 1 5.01 11.35L6.1 12.26V5.4A1.5 1.5 0 0 1 9.1 5.4V4.1A1.5 1.5 0 0 1 12.1 4.1V5.1A1.5 1.5 0 0 1 15.1 5.1V7.3A1.5 1.5 0 0 1 18.1 7.3V13.4C18.1 17.2 15.5 16.4 15.5 18.6V21.4" />
        <path d="M9.1 5.4V12.3M12.1 5.1V12.3M15.1 7.3V12.3" />
      </motion.g>
      <motion.path
        d="M3.3 3.2A4.81 4.81 0 0 0 3.3 8.2"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [1, 0, 0, 1, 1] } : { opacity: 1 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.1, 0.62, 0.8, 1] }}
      />
      <motion.path
        d="M20.7 3.2A4.81 4.81 0 0 1 20.7 8.2"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [1, 0, 0, 1, 1] } : { opacity: 1 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.1, 0.72, 0.9, 1] }}
      />
    </svg>
  );
}
