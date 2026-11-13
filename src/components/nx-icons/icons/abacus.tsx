"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AbacusIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff9f0a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Three beads, one on each rod, slide across to the empty slot and back as if counting. */
export function AbacusIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AbacusIconProps) {
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
      <path d="M3 8H21M3 12H21M3 16H21" strokeWidth={strokeWidth * 0.75} />
      <path d="M6.3 8h.01" strokeWidth={3} />
      <path d="M10.1 8h.01" strokeWidth={3} />

      <motion.path
        d="M13.9 8h.01"
        stroke={accent}
        strokeWidth={3}
        initial={false}
        animate={on ? { x: [0, 3.8, 3.8, 0] } : { x: 0 }}
        transition={{ duration: 0.7 / speed, delay: (on ? 0 : 0) / speed, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
      />

      <motion.path
        d="M6.3 12h.01"
        stroke={accent}
        strokeWidth={3}
        initial={false}
        animate={on ? { x: [0, 3.8, 3.8, 0] } : { x: 0 }}
        transition={{ duration: 0.7 / speed, delay: (on ? 0.15 : 0) / speed, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
      />
      <path d="M13.9 12h.01" strokeWidth={3} />
      <path d="M17.7 12h.01" strokeWidth={3} />
      <path d="M6.3 16h.01" strokeWidth={3} />
      <path d="M10.1 16h.01" strokeWidth={3} />

      <motion.path
        d="M17.7 16h.01"
        stroke={accent}
        strokeWidth={3}
        initial={false}
        animate={on ? { x: [0, -3.8, -3.8, 0] } : { x: 0 }}
        transition={{ duration: 0.7 / speed, delay: (on ? 0.3 : 0) / speed, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
      />
      <rect x="3" y="4" width="18" height="16" rx="2" />
    </svg>
  );
}
