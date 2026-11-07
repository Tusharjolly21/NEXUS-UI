"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type StethoscopeIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The chest piece sways on its tube while a heartbeat ring blips twice around the disc. */
export function StethoscopeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: StethoscopeIconProps) {
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
        style={{ originX: "35.42%", originY: "55.83%" }}
        initial={false}
        animate={on ? { rotate: [0, -9, 7, -4, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M8.5 13.4V14.9a3 3 0 0 0 3 3h2" />
        <circle cx="16.5" cy="17.9" r="3" />
        <motion.circle
          cx="16.5"
          cy="17.9"
          r="1.1"
          fill={accent}
          stroke="none"
          style={{ originX: "68.75%", originY: "74.58%" }}
          initial={false}
          animate={on ? { scale: [1, 1.5, 1, 1.4, 1] } : { scale: 1 }}
          transition={{ duration: 0.8 / speed, delay: (0.3) / speed, times: [0, 0.2, 0.4, 0.6, 1] }}
        />
        <motion.circle
          cx="16.5"
          cy="17.9"
          r="3"
          stroke={accent}
          strokeWidth={0.9}
          style={{ originX: "68.75%", originY: "74.58%" }}
          initial={false}
          animate={on ? { scale: [1, 1.5, 1, 1, 1.5], opacity: [0.9, 0, 0, 0.9, 0] } : { scale: 1, opacity: 0 }}
          transition={{ duration: 0.8 / speed, delay: (0.3) / speed, times: [0, 0.25, 0.3, 0.45, 0.8], ease: "easeOut" }}
        />
      </motion.g>
      <path d="M4.5 3.4V9.4A4 4 0 0 0 12.5 9.4V3.4" />
      <circle cx="4.5" cy="3.4" r="1.3" fill={accent} stroke="none" />
      <circle cx="12.5" cy="3.4" r="1.3" fill={accent} stroke="none" />
    </svg>
  );
}
