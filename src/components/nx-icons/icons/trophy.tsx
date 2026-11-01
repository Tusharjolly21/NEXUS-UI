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
        <path d="M7.4 5.2H5a2.2 2.2 0 0 0 0 4.4h2.8" />
        <path d="M16.6 5.2H19a2.2 2.2 0 0 1 0 4.4h-2.8" />
        <path d="M12 14.6V18" />
        <path d="M9.4 20.8l.8-2.8h3.6l.8 2.8" />
        <motion.path
          d="M7.4 3h9.2v6.2a4.6 4.6 0 0 1-9.2 0z"
          fill={accent}
          initial={false}
          animate={on ? { fillOpacity: [0, 0.35, 0.15] } : { fillOpacity: 0 }}
          transition={{ duration: 0.8 / speed }}
        />
      </motion.g>
      <path d="M8 21.4h8" />
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
