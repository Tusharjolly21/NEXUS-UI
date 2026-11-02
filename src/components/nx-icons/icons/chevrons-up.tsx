"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChevronsUpIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffd60a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Two chevrons that float up and away in turn, then glide back in from below, flashing colour as they settle. */
export function ChevronsUpIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ChevronsUpIconProps) {
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
        initial={false}
        animate={on ? { y: [0, -5.5, 5.5, 0], opacity: [1, 0, 0, 1] } : { x: 0, y: 0, opacity: 1 }}
        transition={{ duration: 0.85 / speed, delay: (0.12) / speed, times: [0, 0.36, 0.37, 0.82], ease: ["easeIn", "linear", "easeOut"] }}
      >
        <path d="M17.5 17.75L12 12.25L6.5 17.75" />
        <motion.path
          d="M17.5 17.75L12 12.25L6.5 17.75"
          stroke={accent}
          initial={false}
          animate={on ? { opacity: [0, 0, 0.9, 0] } : { opacity: 0 }}
          transition={{ duration: 0.85 / speed, delay: (0.12) / speed, times: [0, 0.4, 0.78, 1], ease: "easeOut" }}
        />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { y: [0, -5.5, 5.5, 0], opacity: [1, 0, 0, 1] } : { x: 0, y: 0, opacity: 1 }}
        transition={{ duration: 0.85 / speed, delay: (0) / speed, times: [0, 0.36, 0.37, 0.82], ease: ["easeIn", "linear", "easeOut"] }}
      >
        <path d="M17.5 11.75L12 6.25L6.5 11.75" />
        <motion.path
          d="M17.5 11.75L12 6.25L6.5 11.75"
          stroke={accent}
          initial={false}
          animate={on ? { opacity: [0, 0, 0.9, 0] } : { opacity: 0 }}
          transition={{ duration: 0.85 / speed, delay: (0) / speed, times: [0, 0.4, 0.78, 1], ease: "easeOut" }}
        />
      </motion.g>
    </svg>
  );
}
