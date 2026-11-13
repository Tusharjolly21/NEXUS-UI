"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type EaselIconProps = {
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

/** A brush stroke paints itself across the canvas on its three-legged stand. */
export function EaselIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: EaselIconProps) {
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
      <path d="M12 12.5V21.5" />
      <path d="M8.5 12.5L5.5 21.5M15.5 12.5L18.5 21.5" />
      <motion.path
        d="M8.2 8.8C9.2 5.9 10.8 5.9 12 7.5S14.6 9 15.8 6.4"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6 / speed, delay: (0.1) / speed, ease: "easeInOut" }}
      />
      <rect x="5.5" y="2.5" width="13" height="10" rx="1.5" />
    </svg>
  );
}
