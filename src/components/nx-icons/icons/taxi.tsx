"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TaxiIconProps = {
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

/** A taxi whose roof sign flashes on and off as the car winds back, then lurches forward and settles. */
export function TaxiIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TaxiIconProps) {
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
        animate={on ? { x: [0, -0.7, 1.5, 0] } : { x: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.2, 0.5, 1], ease: "easeInOut" }}
      >
        <path d="M6.4 11.1L8.8 6.6H15.2L17.6 11.1M12 6.6V11.1" />
        <rect x="3" y="11.1" width="18" height="5.2" rx="2" />
        <path d="M18.2 13.7h.01" />
        <circle cx="7.4" cy="18.3" r="2" />
        <circle cx="16.6" cy="18.3" r="2" />
        <motion.path
          d="M10.8 4.3H13.2"
          stroke={accent}
          strokeWidth={3.2}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { opacity: [1, 0.15, 1, 0.15, 1, 1], scale: [1, 0.9, 1.12, 0.9, 1.12, 1] } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.14, 0.3, 0.46, 0.62, 1] }}
        />
        <motion.path
          d="M6.9 2.7L5.9 1.9M6.2 4.5H5"
          stroke={accent}
          strokeWidth={strokeWidth * 0.7}
          initial={false}
          animate={on ? { opacity: [0, 0, 1, 0, 1, 0, 0] } : { opacity: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.14, 0.3, 0.46, 0.62, 0.78, 1] }}
        />
        <motion.path
          d="M17.1 2.7L18.1 1.9M17.8 4.5H19"
          stroke={accent}
          strokeWidth={strokeWidth * 0.7}
          initial={false}
          animate={on ? { opacity: [0, 0, 1, 0, 1, 0, 0] } : { opacity: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.14, 0.3, 0.46, 0.62, 0.78, 1] }}
        />
      </motion.g>
    </svg>
  );
}
