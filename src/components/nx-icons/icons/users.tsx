"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type UsersIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A second person slides in beside the first, as a team forms. */
export function UsersIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: UsersIconProps) {
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
        initial={false}
        animate={on ? { x: [4, -0.4, 0], opacity: [0, 1, 1] } : { x: 0, opacity: 1 }}
        transition={{ duration: 0.45 / speed, times: [0, 0.7, 1], ease: "easeOut" }}
      >
        <path d="M15.3 5.7a3.1 3.1 0 0 1 0 5.9" stroke={accent} />
        <path d="M17.8 14.7c2.2.5 3.7 2.2 3.7 5.3" stroke={accent} />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { y: [0, -1, 0] } : { y: 0 }}
        transition={{ duration: 0.4 / speed }}
      >
        <circle cx="9" cy="8.5" r="3.2" />
        <path d="M3 20c0-3.3 2.6-5.6 6-5.6s6 2.3 6 5.6" />
      </motion.g>
    </svg>
  );
}
