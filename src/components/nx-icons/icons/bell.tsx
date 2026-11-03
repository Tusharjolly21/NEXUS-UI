"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BellIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff3b30. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A bell that winds up, swings and rings, while a notification badge pops onto it. */
export function BellIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BellIconProps) {
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
      <g transform="translate(0 -2.0)">
      <motion.g
        style={{ originX: "50%", originY: "12%" }}
        initial={false}
        animate={on ? { rotate: [0, 9, -20, 15, -10, 5, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 2H5z" />
        <motion.path
          d="M10.2 20.4a1.8 1.8 0 0 0 3.6 0"
          initial={false}
          animate={on ? { x: [0, -1.4, 1.6, -1, 0.6, 0] } : { x: 0 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut", delay: (0.06) / speed }}
        />
      </motion.g>
      <motion.circle
        cx="18.4"
        cy="5.2"
        r="2.5"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { scale: [0, 1.4, 1] } : { scale: 0 }}
        transition={on ? { duration: 0.45 / speed, delay: (0.12) / speed, ease: "easeOut" } : { duration: 0.15 / speed }}
      />
      </g>
    </svg>
  );
}
