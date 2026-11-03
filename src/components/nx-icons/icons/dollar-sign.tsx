"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type DollarSignIconProps = {
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

/** A dollar sign whose S draws itself, the top and bottom bars drop in, and the whole sign pops with a little wobble. */
export function DollarSignIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: DollarSignIconProps) {
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
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1, 1.14, 0.96, 1], rotate: [0, 0, -5, 3, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.55, 0.7, 0.85, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M16.4 8.6C16.2 6.8 14.4 5.6 12 5.6 9.6 5.6 7.6 6.8 7.6 8.8c0 2 2 2.6 4.4 3.2s4.4 1.2 4.4 3.2c0 2-1.8 3.2-4.4 3.2-2.4 0-4.2-1.2-4.4-3"
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.55 / speed, ease: "easeOut" }}
        />
        <motion.path
          d="M12 2.6v3"
          stroke={accent}
          initial={false}
          animate={on ? { y: [-4, 0], opacity: [0, 1] } : { y: 0, opacity: 1 }}
          transition={{ duration: 0.3 / speed, delay: (on ? 0.3 : 0) / speed, ease: "easeOut" }}
        />
        <motion.path
          d="M12 18.4v3"
          stroke={accent}
          initial={false}
          animate={on ? { y: [4, 0], opacity: [0, 1] } : { y: 0, opacity: 1 }}
          transition={{ duration: 0.3 / speed, delay: (on ? 0.3 : 0) / speed, ease: "easeOut" }}
        />
      </motion.g>
      </svg>
    </svg>
  );
}
