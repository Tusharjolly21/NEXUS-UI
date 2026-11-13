"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TrumpetIconProps = {
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

/** Three valves press down in turn while the bell swells with each note. */
export function TrumpetIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TrumpetIconProps) {
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
      <g transform="translate(-0.1 0.11)">
      <path d="M2.8 12H15.5" />
      <path d="M5 12v3.6a2.4 2.4 0 0 0 2.4 2.4h5.7a2.4 2.4 0 0 0 2.4-2.4V12" />
            <path d="M7 8.6V12" />
      <motion.path
        d="M7 5.8h.01"
        stroke={accent}
        strokeWidth={2.4}
        initial={false}
        animate={on ? { y: [0, 1.5, 0, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, delay: (0.1) / speed, times: [0, 0.18, 0.38, 1], ease: "easeInOut" }}
      />
      <path d="M10 8.6V12" />
      <motion.path
        d="M10 5.8h.01"
        stroke={accent}
        strokeWidth={2.4}
        initial={false}
        animate={on ? { y: [0, 1.5, 0, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, delay: (0.32) / speed, times: [0, 0.18, 0.38, 1], ease: "easeInOut" }}
      />
      <path d="M13 8.6V12" />
      <motion.path
        d="M13 5.8h.01"
        stroke={accent}
        strokeWidth={2.4}
        initial={false}
        animate={on ? { y: [0, 1.5, 0, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, delay: (0.54) / speed, times: [0, 0.18, 0.38, 1], ease: "easeInOut" }}
      />
      <motion.g
        style={{ originX: "15.5px", originY: "12px" }}
        initial={false}
        animate={on ? { scale: [1, 1.07, 1, 1.07, 1, 1.07, 1] } : { scale: 1 }}
        transition={{ duration: 0.9 / speed, delay: (0.1) / speed, times: [0, 0.18, 0.3, 0.424, 0.54, 0.669, 0.85] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M15.5 12C18 12 19.8 9 21.4 5.8V18.2C19.8 15 18 12 15.5 12z" />
      </motion.g>
      </g>
    </svg>
  );
}
