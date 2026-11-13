"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PaintRollerIconProps = {
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

/** The roller sweeps in from the right and lays a stripe of paint behind it. */
export function PaintRollerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PaintRollerIconProps) {
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
      <g transform="translate(1.01 0)">
      <motion.path
        d="M8 14.4H3"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6 / speed, ease: "easeOut" }}
      />
      <motion.g
        initial={false}
        animate={on ? { x: [2.8, 0] } : { x: 0 }}
        transition={{ duration: 0.6 / speed, ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <rect x="3" y="3" width="12.5" height="6.4" rx="1.6" />
        <path d="M15.5 6.2H19V12H11.6V21" />
      </motion.g>
      </g>
    </svg>
  );
}
