"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RollerCoasterIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The car plunges down the first drop, races up the next hill, runs out of speed and rolls back to the top. */
export function RollerCoasterIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RollerCoasterIconProps) {
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
      <g transform="translate(0 -0.79)">

      <motion.g
        style={{ originX: "33.35%", originY: "17.29%" }}
        initial={false}
        animate={on ? { x: [0, 0.74, 2.1, 3.01, 3.71, 4.37, 5.07, 5.82, 5.75, 6.54, 7.25, 7.85, 8.11, 7.85, 7.25, 6.54, 5.75, 5.82, 5.07, 4.37, 3.71, 3.01, 2.1, 0.74, 0], y: [0, 0.12, 1.1, 2.66, 4.52, 6.62, 8.69, 10.06, 9.85, 8.6, 7.3, 6.39, 6.09, 6.39, 7.3, 8.6, 9.85, 10.06, 8.69, 6.62, 4.52, 2.66, 1.1, 0.12, 0], rotate: [0, 17.81, 50.49, 65.94, 71.64, 72.56, 68.13, 38.07, -47.45, -62, -59.79, -51.96, -47.45, -51.96, -59.79, -62, -47.45, 38.07, 68.13, 72.56, 71.64, 65.94, 50.49, 17.81, 0] } : { x: 0, y: 0, rotate: 0 }}
        transition={{ duration: 1.4 / speed, times: [0, 0.04, 0.08, 0.12, 0.17, 0.21, 0.25, 0.29, 0.33, 0.38, 0.42, 0.46, 0.5, 0.54, 0.58, 0.62, 0.67, 0.71, 0.75, 0.79, 0.83, 0.88, 0.92, 0.96, 1], ease: "linear" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M6.3 3.9A0.7 0.7 0 0 1 7 3.2L9 3.2A0.7 0.7 0 0 1 9.7 3.9L9.7 4.4A0.7 0.7 0 0 1 9 5.1L7 5.1A0.7 0.7 0 0 1 6.3 4.4Z" fill={accent} stroke="none" />
      </motion.g>
      <path d="M2.6 15.2C4.06 13.01 5.57 5.6 8 5.6C10.52 5.6 11.08 15.6 13.6 15.6C15.76 15.6 16.24 10.6 18.4 10.6C19.75 10.6 20.59 13.52 21.4 14.2" />
      <path d="M4.6 10.43V21.4M8.8 5.97V21.4M13 15.4V21.4M17.2 11.2V21.4" />
      <path d="M2.6 21.4H21.4" />
      </g>
    </svg>
  );
}
