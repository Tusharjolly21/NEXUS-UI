"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GemIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #64d2ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A cut gem that turns on its axis while its facets draw themselves and a sparkle flashes. */
export function GemIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GemIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleX: [1, 0.78, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.5 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M2.5 9.5h19M7 4l2.2 5.5L12 4l2.8 5.5L17 4M9.2 9.5 12 20.5l2.8-11"
          stroke={accent}
          strokeWidth={1.4}
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.5 / speed }}
        />
        <path d="M7 4h10l4.5 5.5L12 20.5 2.5 9.5z" />
      </motion.g>
      <motion.path
        d="M19.6 2.4v2.4M18.4 3.6h2.4"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [0, 1.5, 1], opacity: [0, 1, 1] } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 / speed, delay: (on ? 0.35 : 0) / speed }}
      />
    </svg>
  );
}
