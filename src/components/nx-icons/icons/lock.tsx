"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LockIconProps = {
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

/** A padlock that shakes, springs its shackle open and lights a green dot to say it is unlocked. */
export function LockIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LockIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
        d="M8 11V8a4 4 0 0 1 8 0V11"
        initial={false}
        animate={{ d: on ? "M8 11V6.6a4 4 0 0 1 8 0V8" : "M8 11V8a4 4 0 0 1 8 0V11" }}
        transition={{ type: "spring", stiffness: 380 * speed * speed, damping: 15 * speed, delay: (on ? 0.1 : 0) / speed }}
      />
      <motion.g
        initial={false}
        animate={on ? { x: [0, -0.7, 0.7, 0] } : { x: 0 }}
        transition={{ duration: 0.12 / speed }}
      >
        <rect x="5" y="11" width="14" height="10" rx="2.4" />
        <circle cx="12" cy="15.4" r="1.1" fill="currentColor" stroke="none" />
        <motion.circle
          cx="12"
          cy="15.4"
          r="1.7"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { scale: [0, 1.5, 1] } : { scale: 0 }}
          transition={on ? { duration: 0.35 / speed, delay: (0.2) / speed } : { duration: 0.1 / speed }}
        />
      </motion.g>
    </svg>
  );
}
