"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ArrowUpLeftIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #64d2ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An arrow that streaks off to the upper left, leaving two fading echoes of itself, and slides in again from the lower right. */
export function ArrowUpLeftIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ArrowUpLeftIconProps) {
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
      {[0.07, 0.14].map((d, i) => (
        <motion.g
          key={i}
          stroke={accent}
          initial={false}
          animate={on ? { x: [0, -9], y: [0, -9], opacity: [0, 0.55 - i * 0.2, 0] } : { x: 0, y: 0, opacity: 0 }}
          transition={{ duration: 0.34 / speed, delay: (d) / speed, ease: "easeIn" }}
        >
          <path d="M18.5 18.5L5.5 5.5" />
          <path d="M5.5 12.5L5.5 5.5L12.5 5.5" />
        </motion.g>
      ))}
      <motion.g
        initial={false}
        animate={on ? { x: [0, -9, 9, 0], y: [0, -9, 9, 0], opacity: [1, 0, 0, 1] } : { x: 0, y: 0, opacity: 1 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.38, 0.39, 0.82], ease: ["easeIn", "linear", "easeOut"] }}
      >
        <path d="M18.5 18.5L5.5 5.5" />
        <path d="M5.5 12.5L5.5 5.5L12.5 5.5" />
      </motion.g>
    </svg>
  );
}
