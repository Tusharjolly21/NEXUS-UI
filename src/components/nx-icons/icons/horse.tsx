"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HorseIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ac8e68. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A horse that nods its head while its mane ripples along its neck. */
export function HorseIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HorseIconProps) {
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
        style={{ originX: "70.83%", originY: "89.17%" }}
        initial={false}
        animate={on ? { rotate: [0, -7, 0, -5, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M20.3 21.4L13.5 21.4C13.5 19.4 13.1 17.9 11.7 17.3C10.3 18.9 7.7 19.5 5.6 18.7C3.8 18 2.6 16.6 2.9 15C3.1 13.8 4.6 11 7 8C8.2 6.6 9 6.1 9.7 5.9L11 2.7L13.7 5" />
        <motion.path
          d="M13.7 5A3.55 3.55 0 0 1 16.58 10.16A3.55 3.55 0 0 1 18.69 15.7A3.55 3.55 0 0 1 20.3 21.4"
          stroke={accent}
          initial={false}
          animate={on ? { d: ["M13.7 5A3.55 3.55 0 0 1 16.58 10.16A3.55 3.55 0 0 1 18.69 15.7A3.55 3.55 0 0 1 20.3 21.4", "M13.7 5A3.96 3.96 0 0 1 16.58 10.16A3.14 3.14 0 0 1 18.69 15.7A3.97 3.97 0 0 1 20.3 21.4", "M13.7 5A3.13 3.13 0 0 1 16.58 10.16A3.97 3.97 0 0 1 18.69 15.7A3.14 3.14 0 0 1 20.3 21.4", "M13.7 5A3.96 3.96 0 0 1 16.58 10.16A3.14 3.14 0 0 1 18.69 15.7A3.97 3.97 0 0 1 20.3 21.4", "M13.7 5A3.55 3.55 0 0 1 16.58 10.16A3.55 3.55 0 0 1 18.69 15.7A3.55 3.55 0 0 1 20.3 21.4"] } : { d: "M13.7 5A3.55 3.55 0 0 1 16.58 10.16A3.55 3.55 0 0 1 18.69 15.7A3.55 3.55 0 0 1 20.3 21.4" }}
          transition={{ duration: 0.9 / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
        />
        <circle cx="9.4" cy="10.4" r="1" fill="currentColor" stroke="none" />
        <path d="M4 15.3h0.01" strokeWidth={1.6} />
      </motion.g>
    </svg>
  );
}
