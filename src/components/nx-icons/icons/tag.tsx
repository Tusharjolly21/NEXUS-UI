"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TagIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A price tag that swings from its hole like it has just been hung up. */
export function TagIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TagIconProps) {
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
        style={{ originX: "18%", originY: "20%" }}
        initial={false}
        animate={on ? { rotate: [0, -18, 14, -8, 3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <path d="M3.5 12.3V5.5a2 2 0 0 1 2-2h6.8a2 2 0 0 1 1.4.6l7 7a2 2 0 0 1 0 2.8l-6.8 6.8a2 2 0 0 1-2.8 0l-7-7a2 2 0 0 1-.6-1.4z" />
        <circle cx="8" cy="8" r="1.4" fill={accent} stroke={accent} />
      </motion.g>
    </svg>
  );
}
