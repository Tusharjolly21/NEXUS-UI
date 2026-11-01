"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ServerIconProps = {
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

/** A two-unit server rack whose lights blink in turn while activity lines stream across. */
export function ServerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ServerIconProps) {
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
      <rect x="3" y="3.5" width="18" height="7" rx="2" />
      <rect x="3" y="13.5" width="18" height="7" rx="2" />
      <motion.path
        d="M7 7h.01"
        stroke={accent}
        strokeWidth={3}
        initial={false}
        animate={on ? { opacity: [1, 0.2, 1, 0.2, 1] } : { opacity: 1 }}
        transition={{ duration: 0.8 / speed }}
      />
      <motion.path
        d="M7 17h.01"
        stroke={accent}
        strokeWidth={3}
        initial={false}
        animate={on ? { opacity: [1, 0.2, 1, 0.2, 1] } : { opacity: 1 }}
        transition={{ duration: 0.8 / speed, delay: (0.1) / speed }}
      />
      <motion.path
        d="M11 7h6"
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.4 / speed }}
      />
      <motion.path
        d="M11 17h6"
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.4 / speed, delay: (0.3) / speed }}
      />
    </svg>
  );
}
