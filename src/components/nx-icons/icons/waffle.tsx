"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WaffleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffd60a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A pat of butter hops off a waffle and lands back with a soft squash as the waffle gives under it. */
export function WaffleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WaffleIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1, 0.965, 1.01, 1] } : { scale: 1 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.5, 0.6, 0.76, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M7.5 3V21M3 7.5H21M12 3V21M3 12H21M16.5 3V21M3 16.5H21" strokeWidth={strokeWidth * 0.75} />
        <path d="M3 6.4A3.4 3.4 0 0 1 6.4 3L17.6 3A3.4 3.4 0 0 1 21 6.4L21 17.6A3.4 3.4 0 0 1 17.6 21L6.4 21A3.4 3.4 0 0 1 3 17.6Z" />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "59.58%" }}
        initial={false}
        animate={on ? { y: [0, -3.6, 0, 0, 0], scaleY: [1, 1.04, 0.76, 1.06, 1], scaleX: [1, 0.97, 1.16, 0.97, 1] } : { y: 0, scaleY: 1, scaleX: 1 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.3, 0.55, 0.74, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M9.7 10.5A0.8 0.8 0 0 1 10.5 9.7L13.5 9.7A0.8 0.8 0 0 1 14.3 10.5L14.3 13.5A0.8 0.8 0 0 1 13.5 14.3L10.5 14.3A0.8 0.8 0 0 1 9.7 13.5Z" fill={accent} strokeWidth={strokeWidth * 0.75} />
      </motion.g>
    </svg>
  );
}
