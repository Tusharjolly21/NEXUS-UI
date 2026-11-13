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
      <motion.g style={{ originX: "32.5%", originY: "59.17%" }} initial={false} animate={on ? { scale: [1, 1.12, 0.93, 1], rotate: [0, -4, 0, 0] } : { scale: 1, rotate: 0 }} transition={{ duration: 0.6 / speed, times: [0, 0.4, 0.7, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M7.24 7.71C8.77 7.5 10.23 8.88 10.5 10.79C10.77 12.71 9.75 14.43 8.22 14.65C6.68 14.86 5.23 13.48 4.96 11.57C4.69 9.66 5.71 7.93 7.24 7.71ZM7.93 16.91C9.13 16.74 10.23 17.49 10.39 18.58C10.54 19.68 9.69 20.7 8.48 20.87C7.28 21.04 6.18 20.29 6.03 19.2C5.87 18.1 6.72 17.08 7.93 16.91Z"  />
      </motion.g>
      <motion.g style={{ originX: "67.5%", originY: "40.83%" }} initial={false} animate={on ? { scale: [1, 1.12, 0.93, 1], rotate: [0, -4, 0, 0] } : { scale: 1, rotate: 0 }} transition={{ duration: 0.6 / speed, times: [0, 0.4, 0.7, 1], ease: "easeInOut", delay: (0.35) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M16.76 3.31C15.23 3.1 13.77 4.48 13.5 6.39C13.23 8.31 14.25 10.03 15.78 10.25C17.32 10.46 18.77 9.08 19.04 7.17C19.31 5.26 18.29 3.53 16.76 3.31ZM16.07 12.51C14.87 12.34 13.77 13.09 13.61 14.18C13.46 15.28 14.31 16.3 15.52 16.47C16.72 16.64 17.82 15.89 17.97 14.8C18.13 13.7 17.28 12.68 16.07 12.51Z" stroke={accent} />
      </motion.g>
    </svg>
  );
}
