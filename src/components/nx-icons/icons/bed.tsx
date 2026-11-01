"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BedIconProps = {
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

/** A bed whose blanket rises and falls with each breath while the z's float away. */
export function BedIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BedIconProps) {
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
      <path d="M3 5v15M21 20v-4M3 16h18" />
      <rect x="5.2" y="12" width="4.4" height="2.6" rx="1.3" stroke={accent} />
      <motion.path
        d="M11.5 16v-3.2a2 2 0 0 1 2-2H18a3 3 0 0 1 3 3V16"
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.14, 1, 1.1, 1] } : { scaleY: 1 }}
        transition={{ duration: 1.2 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M14.2 4.6h3l-3 3.2h3"
        stroke={accent}
        initial={false}
        animate={on ? { y: [0, -2.4, 0], opacity: [1, 0.15, 1] } : { y: 0, opacity: 1 }}
        transition={{ duration: 1.2 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M18.8 2.8h1.8l-1.8 2h1.8"
        stroke={accent}
        initial={false}
        animate={on ? { y: [0, -2, 0], opacity: [1, 0.15, 1] } : { y: 0, opacity: 1 }}
        transition={{ duration: 1.2 / speed, delay: (0.25) / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
