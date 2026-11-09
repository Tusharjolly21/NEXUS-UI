"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HoodieIconProps = {
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

/** A hoodie whose hood bobs while its drawstrings swing. */
export function HoodieIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HoodieIconProps) {
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
      <path d="M6 18L2.8 18L4.4 8.8L8.2 7" />
      <path d="M15.8 7L19.6 8.8L21.2 18L18 18" />
      <path d="M6.9 7.62L6 11.8L6 21L18 21L18 11.8L17.1 7.62" />
      <path d="M8.4 21L9.4 15.6L14.6 15.6L15.6 21" />
      <motion.g
        style={{ originX: "50%", originY: "29.17%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.12, 0.95, 1.03, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M8.2 7C7.2 4.8 9.6 3 12 3C14.4 3 16.8 4.8 15.8 7" />
        <path d="M8.2 7C8.8 8.8 10.4 9.6 12 9.6C13.6 9.6 15.2 8.8 15.8 7" />

        <motion.g
          style={{ originX: "41.82%", originY: "38.13%" }}
          initial={false}
          animate={on ? { rotate: [0, 16, -11, 6, -3, 0] } : { rotate: 0 }}
          transition={{ duration: 0.75 / speed, delay: (on ? 0.05 : 0) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M10 9.15L10 12.95" stroke={accent} strokeWidth={strokeWidth * 0.75} />
        </motion.g>

        <motion.g
          style={{ originX: "58.18%", originY: "38.13%" }}
          initial={false}
          animate={on ? { rotate: [0, 16, -11, 6, -3, 0] } : { rotate: 0 }}
          transition={{ duration: 0.75 / speed, delay: (on ? 0.12 : 0) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M14 9.15L14 12.95" stroke={accent} strokeWidth={strokeWidth * 0.75} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
