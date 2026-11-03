"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FolderMinusIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff6b35. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A folder whose front panel tips open while a minus stamps down onto it, shrinking from large to size. */
export function FolderMinusIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FolderMinusIconProps) {
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
      <motion.g
        style={{ originX: "50%", originY: "83.333%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1, 0.8, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.7 / speed, times: [0, 0.3, 0.55, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3 10.4h18v7.9a1.7 1.7 0 0 1-1.7 1.7H4.7A1.7 1.7 0 0 1 3 18.3z" />
      </motion.g>
      <motion.path
        d="M9.5 15.2h5"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1.9, 0.9, 1], opacity: [0, 1, 1] } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 / speed, delay: (on ? 0.15 : 0) / speed, times: [0, 0.7, 1], ease: "easeIn" }}
      />
    </svg>
  );
}
