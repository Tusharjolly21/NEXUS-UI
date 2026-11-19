"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BowlRiceIconProps = {
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

/** A pair of chopsticks lifts out of a heaped bowl of rice, pauses and settles back onto the mound with a little tap. */
export function BowlRiceIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BowlRiceIconProps) {
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
      <g transform="translate(0 0.12)">

      <motion.g
        stroke={accent}
        style={{ originX: "75.83%", originY: "12.08%" }}
        initial={false}
        animate={on ? { x: [0, 1.21, 1.21, 0, 0.3, 0], y: [0, -0.88, -0.88, 0, -0.22, 0], rotate: [0, -8, -8, 0, -2, 0] } : { x: 0, y: 0, rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.28, 0.5, 0.72, 0.84, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M18.2 2.9L10.26 8.67M19.96 5.33L14.92 8.99" />
      </motion.g>
      <path d="M5.6 13A6.4 4.5 0 0 1 18.4 13" />
      <path d="M3 13H21A9 6.3 0 0 1 15.4 18.83L15.4 20.9H8.6L8.6 18.83A9 6.3 0 0 1 3 13Z" />

      </g>
    </svg>
  );
}
