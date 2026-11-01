"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CheckCircleIconProps = {
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

/** A circled tick that pops, draws itself in and sends out a ring. */
export function CheckCircleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CheckCircleIconProps) {
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
        stroke={accent}
        initial={false}
        animate={on ? { scale: [1, 1.3], opacity: [0.9, 0] } : { scale: 1, opacity: 0 }}
        transition={on ? { duration: 0.6 / speed, delay: (0.3) / speed, ease: "easeOut" } : { duration: 0.1 / speed }}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="9"
        initial={false}
        animate={on ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.5 / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M8 12.4l2.7 2.7 5.3-5.6"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.45 / speed, ease: "easeOut" }}
      />
    </svg>
  );
}
