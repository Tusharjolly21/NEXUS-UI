"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FlamingoIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff6fae. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The flamingo dips its curved neck down towards the water and lifts its head back up, balanced on one leg. */
export function FlamingoIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FlamingoIconProps) {
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
      <g transform="translate(-1.21 0.12)">

      <path d="M14 13.53V21M16.6 12.72L19.0 16.4L17.4 18.2" />
      <motion.path
        d="M11.4 10.01C10.53 9.81 9.27 9.84 8.8 9.4C8.33 8.96 8.33 7.93 8.6 7.4C8.87 6.87 10.17 6.83 10.4 6.2C10.63 5.57 10.13 4.47 10 3.6"
        initial={false}
        animate={on ? { d: ["M11.4 10.01C10.53 9.81 9.27 9.84 8.8 9.4C8.33 8.96 8.33 7.93 8.6 7.4C8.87 6.87 10.17 6.83 10.4 6.2C10.63 5.57 10.13 4.47 10 3.6", "M11.4 10.01C10.63 10.07 9.62 10.34 9.1 10.2C8.58 10.06 8.37 9.55 8.3 9.2C8.23 8.85 8.63 8.62 8.7 8.1C8.77 7.58 8.7 6.77 8.7 6.1", "M11.4 10.01C10.73 10.34 9.97 10.84 9.4 11C8.83 11.16 8.4 11.17 8 11C7.6 10.83 7.1 10.4 7 10C6.9 9.6 7.27 9.07 7.4 8.6", "M11.4 10.01C10.73 10.34 9.97 10.84 9.4 11C8.83 11.16 8.4 11.17 8 11C7.6 10.83 7.1 10.4 7 10C6.9 9.6 7.27 9.07 7.4 8.6", "M11.4 10.01C10.63 10.07 9.62 10.34 9.1 10.2C8.58 10.06 8.37 9.55 8.3 9.2C8.23 8.85 8.63 8.62 8.7 8.1C8.77 7.58 8.7 6.77 8.7 6.1", "M11.4 10.01C10.53 9.81 9.27 9.84 8.8 9.4C8.33 8.96 8.33 7.93 8.6 7.4C8.87 6.87 10.17 6.83 10.4 6.2C10.63 5.57 10.13 4.47 10 3.6"] } : { d: "M11.4 10.01C10.53 9.81 9.27 9.84 8.8 9.4C8.33 8.96 8.33 7.93 8.6 7.4C8.87 6.87 10.17 6.83 10.4 6.2C10.63 5.57 10.13 4.47 10 3.6" }}
        transition={{ duration: 1 / speed, times: [0, 0.18, 0.36, 0.6, 0.8, 1], ease: "easeInOut" }}
      />
      <motion.g
        style={{ originX: "41.67%", originY: "15%" }}
        initial={false}
        animate={on ? { x: [0, -1.3, -2.6, -2.6, -1.3, 0], y: [0, 2.5, 5, 5, 2.5, 0], rotate: [0, -15, -30, -30, -15, 0] } : { x: 0, y: 0, rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.18, 0.36, 0.6, 0.8, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="10" cy="3.6" r="1.8" fill="currentColor" stroke="none" />
        <path d="M9.2 3.6Q6.2 3.4 6.2 6.2" />
      </motion.g>
      <path d="M10.6 11.4C10.73 10.7 11.7 9.47 12.6 9C13.5 8.53 14.73 8.63 16 8.6C17.27 8.57 20.2 8.8 20.2 8.8C20.2 8.8 19.3 10.83 18.4 11.6C17.5 12.37 15.9 13.13 14.8 13.4C13.7 13.67 12.5 13.53 11.8 13.2C11.1 12.87 10.47 12.1 10.6 11.4Z" fill={accent} />

      </g>
    </svg>
  );
}
