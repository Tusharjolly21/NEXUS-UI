"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ItalicIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A slanted letter I that stands up straight, then leans back into its italic slope with a small overshoot. */
export function ItalicIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ItalicIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { skewX: [0, 20.5, -6, 2, 0] } : { skewX: 0 }}
        transition={{ duration: 0.95 / speed, times: [0, 0.35, 0.65, 0.85, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M11 4h8" />
        <path d="M5 20h8" />
        <path d="M15 4 9 20" stroke={accent} />
      </motion.g>
    </svg>
  );
}
