"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TrophyIconProps = {
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

/** A trophy that bounces up in triumph and lands with a glint. */
export function TrophyIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TrophyIconProps) {
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
        animate={on ? { y: [0, -1.3, 0, -0.6, 0] } : { y: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M10 14.66V17c0 .55-.47.98-1.04 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98 1.04 1.21C16.15 18.75 17 20.24 17 22" />
        <motion.path
          d="M18 2H6v7a6 6 0 0 0 12 0V2Z"
          fill={accent}
          initial={false}
          animate={on ? { fillOpacity: [0, 0.35, 0.15] } : { fillOpacity: 0 }}
          transition={{ duration: 0.8 / speed }}
        />
      </motion.g>
      <path d="M4 22h16" />
      <motion.path
        d="M9.5 5.5h.01M14.5 8h.01M11 9.5h.01"
        stroke={accent}
        strokeWidth={2.6}
        initial={false}
        animate={on ? { opacity: [0, 1, 0, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.5, 0.65, 1] }}
      />
    </svg>
  );
}
