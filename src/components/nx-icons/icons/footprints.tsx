"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FootprintsIconProps = {
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

/** Two footprints that lift and press down one after the other, as if walking away. */
export function FootprintsIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FootprintsIconProps) {
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
      <g transform="translate(0 -0.46)">
      <motion.g style={{ originX: "27.92%", originY: "57.71%" }} initial={false} animate={on ? { scale: [1, 1.12, 0.93, 1], rotate: [0, -4, 0, 0] } : { scale: 1, rotate: 0 }} transition={{ duration: 0.6 / speed, times: [0, 0.4, 0.7, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M6.2 10.29C6.96 10.18 7.95 10.14 8.55 10.46C9.15 10.78 9.56 11.58 9.8 12.2C10.04 12.83 10.05 13.58 9.98 14.2C9.92 14.81 9.52 15.37 9.41 15.89C9.3 16.41 9.24 16.83 9.31 17.32C9.38 17.82 9.85 18.32 9.83 18.86C9.8 19.41 9.5 20.15 9.16 20.57C8.81 20.99 8.27 21.3 7.76 21.38C7.25 21.45 6.54 21.31 6.09 21C5.64 20.7 5.3 20.04 5.07 19.53C4.85 19.02 4.87 18.45 4.75 17.96C4.63 17.47 4.56 17.08 4.36 16.6C4.16 16.13 3.73 15.68 3.54 15.1C3.36 14.52 3.19 13.79 3.27 13.12C3.34 12.45 3.5 11.57 3.99 11.1C4.48 10.63 5.44 10.39 6.2 10.29Z"  />
      <circle cx="9.01" cy="8.48" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="6.6" cy="7.95" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="4.4" cy="8.43" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="2.54" cy="9.76" r="0.8" fill="currentColor" stroke="none" />
      </motion.g>
      <motion.g style={{ originX: "72.08%", originY: "38.54%" }} initial={false} animate={on ? { scale: [1, 1.12, 0.93, 1], rotate: [0, -4, 0, 0] } : { scale: 1, rotate: 0 }} transition={{ duration: 0.6 / speed, times: [0, 0.4, 0.7, 1], ease: "easeInOut", delay: (0.35) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M17.8 5.69C17.04 5.58 16.05 5.54 15.45 5.86C14.85 6.18 14.44 6.98 14.2 7.6C13.96 8.23 13.95 8.98 14.02 9.6C14.08 10.21 14.48 10.77 14.59 11.29C14.7 11.81 14.76 12.23 14.69 12.72C14.62 13.22 14.15 13.72 14.17 14.26C14.2 14.81 14.5 15.55 14.84 15.97C15.19 16.39 15.73 16.7 16.24 16.78C16.75 16.85 17.46 16.71 17.91 16.4C18.36 16.1 18.7 15.44 18.93 14.93C19.15 14.42 19.13 13.85 19.25 13.36C19.37 12.87 19.44 12.48 19.64 12C19.84 11.53 20.27 11.08 20.46 10.5C20.64 9.92 20.81 9.19 20.73 8.52C20.66 7.85 20.5 6.97 20.01 6.5C19.52 6.03 18.56 5.79 17.8 5.69Z" stroke={accent} />
      <circle cx="14.99" cy="3.88" r="1.05" fill={accent} stroke="none" />
      <circle cx="17.4" cy="3.35" r="0.8" fill={accent} stroke="none" />
      <circle cx="19.6" cy="3.83" r="0.8" fill={accent} stroke="none" />
      <circle cx="21.46" cy="5.16" r="0.8" fill={accent} stroke="none" />
      </motion.g>
      </g>
    </svg>
  );
}
