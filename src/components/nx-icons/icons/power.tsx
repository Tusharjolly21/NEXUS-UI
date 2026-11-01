"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PowerIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff3b30. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A power symbol whose line pulses upward while a ring of glow blooms around it. */
export function PowerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PowerIconProps) {
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
        animate={on ? { scale: [0.7, 1.12], opacity: [0.8, 0] } : { opacity: 0, scale: 0.7 }}
        transition={on ? { duration: 0.5 / speed, delay: (0.1) / speed, ease: "easeOut" } : { duration: 0.1 / speed }}
      />
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <motion.path
        d="M12 2v10"
        stroke={accent}
        initial={false}
        animate={on ? { y: [0, -1.6, 0], opacity: [1, 0.5, 1] } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.5 / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
