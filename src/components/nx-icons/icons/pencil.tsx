"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PencilIconProps = {
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

/** A pencil that scribbles, leaving an orange line written underneath it. */
export function PencilIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PencilIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
        d="M10 21h10"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.7 / speed, delay: (0.05) / speed, ease: "easeOut" }}
      />
      <motion.g
        style={{ originX: "20%", originY: "90%" }}
        initial={false}
        animate={on ? { x: [0, 1.6, 0, 1.6, 0], y: [0, -0.8, 0, -0.8, 0], rotate: [0, 3, -2, 3, 0] } : { x: 0, y: 0, rotate: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <path d="M16.5 3.8a2.1 2.1 0 0 1 3 3L7.8 18.5l-4.3 1.2 1.2-4.3z" />
        <path d="M14.8 5.5l3.7 3.7" stroke={accent} />
      </motion.g>
    </svg>
  );
}
