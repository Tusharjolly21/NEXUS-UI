"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type UndoIconProps = {
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

/** A curved arrow that winds back, as if rewinding, and snaps home. */
export function UndoIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: UndoIconProps) {
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
        style={{ originX: "22%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, -32, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6 / speed, ease: "easeInOut" }}
      >
        <path d="M4.5 9.5H14a5 5 0 0 1 0 10H8.5" />
        <path d="M8.5 5.5l-4 4 4 4" stroke={accent} />
      </motion.g>
    </svg>
  );
}
