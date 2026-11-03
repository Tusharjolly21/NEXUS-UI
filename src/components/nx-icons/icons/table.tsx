"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TableIconProps = {
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

/** A table whose row and column lines draw themselves one after another, then the three header cells flash in turn. */
export function TableIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TableIconProps) {
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
        d="M3 9.5H21"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0.02, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.3 / speed, ease: "easeOut" }}
      />
      {[0, 1, 2].map((i) => (
        <motion.rect
          key={i}
          x={4 + i * 6}
          y="5"
          width="4"
          height="3.5"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { fillOpacity: [0, 0.4, 0] } : { fillOpacity: 0 }}
          transition={{ duration: 0.34 / speed, delay: (0.52 + i * 0.1) / speed }}
        />
      ))}
      <motion.path
        d="M3 14.75H21"
        initial={false}
        animate={on ? { pathLength: [0.02, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.3 / speed, delay: (0.09) / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M9 4V20"
        initial={false}
        animate={on ? { pathLength: [0.02, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.3 / speed, delay: (0.18) / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M15 4V20"
        initial={false}
        animate={on ? { pathLength: [0.02, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.3 / speed, delay: (0.27) / speed, ease: "easeOut" }}
      />
      <rect x="3" y="4" width="18" height="16" rx="2.6" />
    </svg>
  );
}
