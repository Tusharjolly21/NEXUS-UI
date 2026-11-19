"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CherriesIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #e5243b. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Two cherries swing on their stems from the shared twig, out of step, while the leaf flutters. */
export function CherriesIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CherriesIconProps) {
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
      <g transform="translate(0 0.5)">

      <motion.g
        style={{ originX: "54.17%", originY: "19.17%" }}
        initial={false}
        animate={on ? { rotate: [0, 8, -5, 3, -1, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.2, 0.42, 0.62, 0.82, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="7.05" cy="17.2" r="3.6" fill={accent} />
        <path d="M7.05 13.6C7.05 9.8 10.4 7.4 13 4.6" />
      </motion.g>
      <motion.g
        style={{ originX: "54.17%", originY: "19.17%" }}
        initial={false}
        animate={on ? { rotate: [0, -6, 6, -3, 1, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.24, 0.46, 0.66, 0.84, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="16.95" cy="17.2" r="3.6" fill={accent} />
        <path d="M16.95 13.6C16.95 10.2 13.9 8 13 4.6" />
      </motion.g>
      <motion.g
        style={{ originX: "54.17%", originY: "19.17%" }}
        initial={false}
        animate={on ? { rotate: [0, -10, 5, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M13 4.6Q16.86 6.82 18.96 2.89Q15.1 0.67 13 4.6Z" />
      </motion.g>

      </g>
    </svg>
  );
}
