"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FryingPanIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffb020. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The pan flicks upward and tosses the fried egg, which spins once in the air and drops back onto the pan. */
export function FryingPanIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FryingPanIconProps) {
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
      <g transform="translate(0.25 0.25)">

      <motion.g
        style={{ originX: "82.08%", originY: "82.08%" }}
        initial={false}
        animate={on ? { rotate: [0, -10, -10, 3, 0] } : { rotate: 0 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.16, 0.34, 0.72, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="9.8" cy="9.8" r="7.3" />
        <path d="M15.91 13.79L20.58 18.46A1.5 1.5 0 0 1 18.46 20.58L13.79 15.91" />
        <motion.g
          style={{ originX: "40.83%", originY: "40.83%" }}
          initial={false}
          animate={on ? { y: [0, 0, -3.2, 0, 0], rotate: [0, 0, 200, 360, 360] } : { y: 0, rotate: 0 }}
          transition={{ duration: 1.1 / speed, times: [0, 0.16, 0.44, 0.74, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M9.92 6.54A3.6 3.6 0 1 0 13 10.2A2.4 2.4 0 0 0 9.92 6.54Z" />
          <circle cx="9.4" cy="10.1" r="1.4" fill={accent} stroke="none" />
        </motion.g>
      </motion.g>

      </g>
    </svg>
  );
}
