"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChevronsDownIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Two stacked chevrons that nod downwards one after the other, each leaving a fading colour trail. */
export function ChevronsDownIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ChevronsDownIconProps) {
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
        d="M6.5 6.25L12 11.75L17.5 6.25"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 0.55, 0] } : { opacity: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0.15) / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M6.5 6.25L12 11.75L17.5 6.25"
        initial={false}
        animate={on ? { y: [0, 3.2, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0.1) / speed, times: [0, 0.4, 1], ease: ["easeOut", "easeInOut"] }}
      />
      <motion.path
        d="M6.5 12.25L12 17.75L17.5 12.25"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 0.55, 0] } : { opacity: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0.05) / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M6.5 12.25L12 17.75L17.5 12.25"
        initial={false}
        animate={on ? { y: [0, 3.2, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0) / speed, times: [0, 0.4, 1], ease: ["easeOut", "easeInOut"] }}
      />
    </svg>
  );
}
