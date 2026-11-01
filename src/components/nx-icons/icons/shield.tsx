"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ShieldIconProps = {
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

/** A shield that takes a hit, flashes a ring and draws a tick to say you are protected. */
export function ShieldIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ShieldIconProps) {
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
        d="M12 3 4.6 6v5.4c0 4.5 3.1 7.9 7.4 9.6 4.3-1.7 7.4-5.1 7.4-9.6V6z"
        stroke={accent}
        initial={false}
        animate={on ? { scale: [1, 1.28], opacity: [0.9, 0] } : { scale: 1, opacity: 0 }}
        transition={on ? { duration: 0.6 / speed, delay: (0.2) / speed, ease: "easeOut" } : { duration: 0.1 / speed }}
      />
      <motion.path
        d="M12 3 4.6 6v5.4c0 4.5 3.1 7.9 7.4 9.6 4.3-1.7 7.4-5.1 7.4-9.6V6z"
        initial={false}
        animate={on ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.4 / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M8.6 12.2l2.5 2.5 4.4-4.8"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.4 / speed, delay: (0.15) / speed, ease: "easeOut" }}
      />
    </svg>
  );
}
