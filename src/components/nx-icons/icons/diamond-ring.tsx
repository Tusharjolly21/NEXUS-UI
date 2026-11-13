"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type DiamondRingIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #22d3ee. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The diamond pops with a springy scale while two sparkles twinkle on and off beside it. */
export function DiamondRingIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: DiamondRingIconProps) {
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
      <g transform="translate(0 0.21)">

      <circle cx="12" cy="15.8" r="5.2" />
      <motion.g
        style={{ originX: "50%", originY: "25%" }}
        initial={false}
        animate={on ? { scale: [1, 1.14, 0.97, 1], y: [0, -1, 0, 0] } : { scale: 1, y: 0 }}
        transition={{ duration: 0.7 / speed, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M8.76 2.94A0.8 0.8 0 0 1 9.41 2.6L14.59 2.6A0.8 0.8 0 0 1 15.24 2.94L17.4 6L12 10.6L6.6 6Z" />
        <path d="M6.6 6H17.4" />
      </motion.g>
        <motion.path
          d="M20.2 1Q20.62 3.18 22.8 3.6Q20.62 4.02 20.2 6.2Q19.78 4.02 17.6 3.6Q19.78 3.18 20.2 1Z"
          fill={accent}
          stroke="none"
          style={{ originX: "84.17%", originY: "15%" }}
          initial={false}
          animate={on ? { scale: [0, 1.15, 0.9, 0], rotate: [-30, 0, 30, 60], opacity: [0, 1, 1, 0] } : { scale: 0, opacity: 0, rotate: 0 }}
          transition={{ duration: 0.7 / speed, delay: (0.12) / speed, times: [0, 0.35, 0.65, 1], ease: "easeInOut" }}
        />
        <motion.path
          d="M3.8 7.6Q4.12 9.28 5.8 9.6Q4.12 9.92 3.8 11.6Q3.48 9.92 1.8 9.6Q3.48 9.28 3.8 7.6Z"
          fill={accent}
          stroke="none"
          style={{ originX: "15.83%", originY: "40%" }}
          initial={false}
          animate={on ? { scale: [0, 1.15, 0.9, 0], rotate: [-30, 0, 30, 60], opacity: [0, 1, 1, 0] } : { scale: 0, opacity: 0, rotate: 0 }}
          transition={{ duration: 0.7 / speed, delay: (0.3) / speed, times: [0, 0.35, 0.65, 1], ease: "easeInOut" }}
        />

      </g>
    </svg>
  );
}
