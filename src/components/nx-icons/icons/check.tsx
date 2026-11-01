"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CheckIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A tick that draws itself in, then pops while a ring of green blooms out around it. */
export function CheckIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CheckIconProps) {
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
        r="9.5"
        stroke={accent}
        initial={false}
        animate={on ? { scale: [0.6, 1.15], opacity: [0.9, 0] } : { opacity: 0, scale: 0.6 }}
        transition={on ? { duration: 0.5 / speed, delay: (0.3) / speed, ease: "easeOut" } : { duration: 0.1 / speed }}
      />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1, 1.22, 1] } : { scale: 1 }}
        transition={{ duration: 0.5 / speed, times: [0, 0.6, 0.8, 1] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M5 12.8l4.6 4.6L19 7.6"
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.3 / speed, delay: (on ? 0.05 : 0) / speed, ease: "easeOut" }}
        />
      </motion.g>
    </svg>
  );
}
