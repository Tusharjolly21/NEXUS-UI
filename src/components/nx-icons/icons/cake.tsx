"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CakeIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A birthday cake whose candle flame flickers as the frosting wiggles. */
export function CakeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CakeIconProps) {
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
        animate={on ? { y: [0, -1, 0] } : { y: 0 }}
        transition={{ duration: 0.4 / speed }}
      >
        <rect x="4" y="13" width="16" height="8" rx="1.5" />
        <path d="M12 13V9" />
        <path d="M4 16.5q2 2.5 4 0t4 0 4 0 4 0" stroke={accent} />
      </motion.g>
      <motion.path
        d="M12 7.8c-1.4-1.2-1.6-2.6 0-4.4 1.6 1.8 1.4 3.2 0 4.4z"
        fill={accent}
        stroke={accent}
        strokeWidth={1.4}
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.25, 0.85, 1.15, 1], skewX: [0, -8, 6, -4, 0] } : { scaleY: 1, skewX: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
