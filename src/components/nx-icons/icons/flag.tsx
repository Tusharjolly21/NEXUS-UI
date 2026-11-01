"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FlagIconProps = {
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

/** A flag on a pole whose cloth ripples in the wind. */
export function FlagIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FlagIconProps) {
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
        d="M6 4.5c2.6-1.6 4.8 1.6 7.4.2 2.2-1.2 3.7-.8 5.6.2v8c-1.9-1-3.4-1.4-5.6-.2-2.6 1.4-4.8-1.8-7.4-.2z"
        fill={accent}
        fillOpacity={0.22}
        stroke={accent}
        style={{ originX: "0%", originY: "50%" }}
        initial={false}
        animate={on ? { skewY: [0, 7, -5, 4, 0], scaleX: [1, 0.94, 1.03, 0.97, 1] } : { skewY: 0, scaleX: 1 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      />
      <path d="M6 3v18" />
    </svg>
  );
}
