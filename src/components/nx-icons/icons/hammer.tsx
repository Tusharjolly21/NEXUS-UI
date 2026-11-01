"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HammerIconProps = {
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

/** A hammer that is raised, brought down hard and throws off a spark. */
export function HammerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HammerIconProps) {
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
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { rotate: [0, -34, 8, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.45, 0.7, 1], ease: "easeInOut" }}
      >
        <rect x="10.4" y="9.5" width="3.2" height="11.5" rx="1.6" stroke={accent} />
        <rect x="5" y="3.5" width="14" height="6" rx="1.6" />
      </motion.g>
      <motion.path
        d="M20.9 5.4l1-.9M21.2 7.5h1.1"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 0, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.62, 0.72, 1] }}
      />
    </svg>
  );
}
