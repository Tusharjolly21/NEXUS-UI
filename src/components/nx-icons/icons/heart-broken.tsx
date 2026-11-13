"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HeartBrokenIconProps = {
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

/** A heart splits down a zigzag crack, the halves swing apart on their tip, then knock back together. */
export function HeartBrokenIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HeartBrokenIconProps) {
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
      <motion.g style={{ originX: "50%", originY: "85.42%" }} initial={false} animate={on ? { rotate: [0, -6, -6, 2, 0], x: [0, -0.35, -0.35, 0.1, 0] } : { rotate: 0, x: 0 }} transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.55, 0.78, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M12 6.3L10.4 9.6L13.6 12.8L12 16L12 20.5" stroke={accent} />
      <path d="M12 6.3A4.7 4.7 0 1 0 4.12 11.25L12 20.5"  />
      </motion.g>
      <motion.g style={{ originX: "50%", originY: "85.42%" }} initial={false} animate={on ? { rotate: [0, 6, 6, -2, 0], x: [0, 0.35, 0.35, -0.1, 0] } : { rotate: 0, x: 0 }} transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.55, 0.78, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M12 6.3L10.4 9.6L13.6 12.8L12 16L12 20.5" stroke={accent} />
      <path d="M12 20.5L19.88 11.25A4.7 4.7 0 1 0 12 6.3"  />
      </motion.g>
    </svg>
  );
}
