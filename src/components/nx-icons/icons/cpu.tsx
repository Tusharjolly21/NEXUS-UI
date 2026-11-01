"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CpuIconProps = {
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

/** A processor whose pins light up in a ring, side by side, while the die at its heart glows. */
export function CpuIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CpuIconProps) {
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
        animate={on ? { opacity: [1, 0.2, 1] } : { opacity: 1 }}
        transition={{ duration: 0.3 / speed }}
      >
        <path d="M9.3 3v3.5M12 3v3.5M14.7 3v3.5" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { opacity: [1, 0.2, 1] } : { opacity: 1 }}
        transition={{ duration: 0.3 / speed, delay: (0.12) / speed }}
      >
        <path d="M17.5 9.3H21M17.5 12H21M17.5 14.7H21" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { opacity: [1, 0.2, 1] } : { opacity: 1 }}
        transition={{ duration: 0.3 / speed, delay: (0.24) / speed }}
      >
        <path d="M9.3 17.5V21M12 17.5V21M14.7 17.5V21" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { opacity: [1, 0.2, 1] } : { opacity: 1 }}
        transition={{ duration: 0.3 / speed, delay: (0.36) / speed }}
      >
        <path d="M3 9.3h3.5M3 12h3.5M3 14.7h3.5" />
      </motion.g>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2" />
      <motion.rect
        x="9.8"
        y="9.8"
        width="4.4"
        height="4.4"
        rx="0.8"
        stroke={accent}
        fill={accent}
        initial={false}
        animate={on ? { fillOpacity: [0, 0.7, 0.25, 0] } : { fillOpacity: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.7, 1] }}
      />
    </svg>
  );
}
