"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type UnderlineIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #32ade6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A letter U that presses down slightly while a line draws itself beneath it from left to right. */
export function UnderlineIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: UnderlineIconProps) {
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
      <motion.path
        d="M7 3.5V11a5 5 0 0 0 10 0V3.5"
        initial={false}
        animate={on ? { y: [0, 1, 0] } : { y: 0 }}
        transition={{ duration: 0.4 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M5 20.5h14"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.5 / speed, delay: (on ? 0.2 : 0) / speed, ease: "easeOut" }}
      />
    </svg>
  );
}
