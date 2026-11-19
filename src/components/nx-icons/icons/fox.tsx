"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FoxIconProps = {
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

/** The fox tilts its head one way then the other, curious, and blinks once. */
export function FoxIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FoxIconProps) {
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
        style={{ originX: "50%", originY: "58.33%" }}
        initial={false}
        animate={on ? { rotate: [0, -10, -10, 7, 0] } : { rotate: 0 }}
        transition={{ duration: 0.95 / speed, times: [0, 0.22, 0.45, 0.7, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M13.18 19.1A1.6 1.6 0 0 1 10.82 19.1L4.79 12.46A2.4 2.4 0 0 1 4.17 10.68L4.56 5.27A0.9 0.9 0 0 1 6.09 4.69L9.04 7.64A0.9 0.9 0 0 0 9.67 7.9L14.33 7.9A0.9 0.9 0 0 0 14.96 7.64L17.91 4.69A0.9 0.9 0 0 1 19.44 5.27L19.83 10.68A2.4 2.4 0 0 1 19.21 12.46Z" fill={accent} />
        <motion.g
          style={{ originX: "50%", originY: "51.67%" }}
          initial={false}
          animate={on ? { scaleY: [1, 1, 0.15, 1, 1] } : { scaleY: 1 }}
          transition={{ duration: 0.95 / speed, times: [0, 0.45, 0.52, 0.6, 1] }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <circle cx="9.1" cy="12.4" r="1.15" fill="currentColor" stroke="none" />
          <circle cx="14.9" cy="12.4" r="1.15" fill="currentColor" stroke="none" />
        </motion.g>
        <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" />
      </motion.g>
    </svg>
  );
}
