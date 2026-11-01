"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ImageIconProps = {
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

/** A picture frame where the mountains draw themselves in and the sun pops into the sky. */
export function ImageIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ImageIconProps) {
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
      <motion.rect
        x="3.5"
        y="4.5"
        width="17"
        height="15"
        rx="2.5"
        initial={false}
        animate={on ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 0.4 / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M3.8 17.5l4.7-4.7 3.8 3.8 3-3 4.9 4.9"
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.4 / speed, delay: (0.1) / speed, ease: "easeOut" }}
      />
      <motion.circle
        cx="8.5"
        cy="9.5"
        r="1.7"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { scale: [0, 1.5, 1] } : { scale: 1 }}
        transition={{ duration: 0.4 / speed, delay: (on ? 0.3 : 0) / speed }}
      />
    </svg>
  );
}
