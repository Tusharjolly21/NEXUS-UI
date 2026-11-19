"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CopyrightIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30b0c7. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The ring presses down like a stamp while the C turns a full circle inside it and clicks back into place. */
export function CopyrightIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CopyrightIconProps) {
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
      <motion.circle
        cx="12"
        cy="12"
        r="9"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 0.9, 1.04, 1] } : { scale: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.25, 0.6, 1], ease: "easeInOut" }}
      />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 0, 380, 360] } : { rotate: 0, transition: { duration: 0 / speed } }}
        transition={{ duration: 0.9 / speed, times: [0, 0.12, 0.8, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M14.85 9.05A4.1 4.1 0 1 0 14.85 14.95" stroke={accent} />
      </motion.g>
    </svg>
  );
}
