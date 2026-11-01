"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ThumbsDownIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff3b30. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A thumb that drops down in disapproval, bounces once and tilts, as if shaking its head. */
export function ThumbsDownIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ThumbsDownIconProps) {
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
      <rect x="3.2" y="3.5" width="4.2" height="9.5" rx="1.3" stroke={accent} />
      <motion.path
        d="M10.5 4h7.2a2.4 2.4 0 0 1 2.3 1.8l1 4a2.4 2.4 0 0 1-2.3 3H14l.5 3.3a2.3 2.3 0 0 1-2.3 2.6c-.6 0-1.1-.3-1.3-.8L10.5 13z"
        style={{ originX: "30%", originY: "20%" }}
        initial={false}
        animate={on ? { y: [0, 2.2, 0, 1, 0], rotate: [0, 6, -3, 2, 0] } : { y: 0, rotate: 0 }}
        transition={{ duration: 0.7 / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
