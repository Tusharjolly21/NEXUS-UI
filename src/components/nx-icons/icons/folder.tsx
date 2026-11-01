"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FolderIconProps = {
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

/** A folder that opens its front and lets a sheet of paper slide up out of it. */
export function FolderIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FolderIconProps) {
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
      <path d="M3 7.5V6.2a1.7 1.7 0 0 1 1.7-1.7h4l2 2.3h8.6A1.7 1.7 0 0 1 21 8.5v9.8a1.7 1.7 0 0 1-1.7 1.7H4.7A1.7 1.7 0 0 1 3 18.3z" />
      <motion.path
        d="M6.5 10.4V7.8h11v2.6"
        stroke={accent}
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scaleY: [0.45, 1.5] } : { scaleY: 0.45 }}
        transition={{ type: "spring", stiffness: 260 * speed * speed, damping: 16 * speed, delay: (on ? 0.2 : 0) / speed }}
      />
      <motion.path
        d="M3 10.4h18v7.9a1.7 1.7 0 0 1-1.7 1.7H4.7A1.7 1.7 0 0 1 3 18.3z"
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scaleY: [1, 0.86, 1], skewX: [0, -5, 0] } : { scaleY: 1, skewX: 0 }}
        transition={{ duration: 0.7 / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
