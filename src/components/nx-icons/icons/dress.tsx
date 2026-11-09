"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type DressIconProps = {
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

/** A dress whose skirt sways from the waist and settles back. */
export function DressIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: DressIconProps) {
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
      <path d="M8.8 2.7L8.8 5.9" />
      <path d="M15.2 2.7L15.2 5.9" />
      <path d="M8.8 5.9C9.8 8.7 14.2 8.7 15.2 5.9" />
      <path d="M8.8 5.9L7.9 8.5L9.2 11.7" />
      <path d="M15.2 5.9L16.1 8.5L14.8 11.7" />
      <motion.g
        style={{ originX: "50%", originY: "48.75%" }}
        initial={false}
        animate={on ? { skewX: [0, -10, 8, -5, 2, 0], scaleX: [1, 1.04, 0.97, 1.02, 1, 1] } : { skewX: 0, scaleX: 1 }}
        transition={{ duration: 0.85 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M9.2 11.7C7.8 14.7 5.4 17.9 3.6 20.5Q12 22.1 20.4 20.5C18.6 17.9 16.2 14.7 14.8 11.7" />
        <path d="M9.2 11.7L14.8 11.7" stroke={accent} />
      </motion.g>
    </svg>
  );
}
