"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CookieIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ac8e68. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A bitten cookie that wobbles on its edge while crumbs fall away. */
export function CookieIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CookieIconProps) {
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
        style={{ originX: "50%", originY: "92%" }}
        initial={false}
        animate={on ? { rotate: [0, -5, 4, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M21.21 10.14A9.4 9.4 0 1 1 12.88 2.64A3.2 3.2 0 0 0 16.92 6.54A3.2 3.2 0 0 0 21.21 10.14z" />
        <path d="M8 9h.01M8.9 15.6h.01M15.4 14.4h.01" stroke={accent} strokeWidth={3} />
      </motion.g>
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.path
          d="M18.6 8.2h.01"
          stroke={accent}
          strokeWidth={2}
          initial={false}
          animate={on ? { y: [0, 4, 11], x: [0, 0.8, 1.4], opacity: [0, 1, 0] } : { y: 0, opacity: 0 }}
          transition={{ duration: 0.65 / speed, delay: (0.2) / speed, ease: "easeIn" }}
        />
        <motion.path
          d="M17.2 6.9h.01"
          stroke={accent}
          strokeWidth={2}
          initial={false}
          animate={on ? { y: [0, 4, 11], x: [0, 0.8, 1.4], opacity: [0, 1, 0] } : { y: 0, opacity: 0 }}
          transition={{ duration: 0.65 / speed, delay: (0.34) / speed, ease: "easeIn" }}
        />
      </svg>
    </svg>
  );
}
