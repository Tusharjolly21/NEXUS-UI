"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MilkCartonIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5ac8fa. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A milk carton that tips forward to pour while a drop falls from its spout. */
export function MilkCartonIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MilkCartonIconProps) {
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
        style={{ originX: "42.5%", originY: "54.58%" }}
        initial={false}
        animate={on ? { rotate: [0, 22, 22, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.3, 0.72, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M5 9.5V19.5H15.4V9.5H5L7.2 4.5H13.2L15.4 9.5" />
        <path d="M13.2 4.5L19 6.5L14.92 8.4" />
        <rect x="7.2" y="12.1" width="6" height="4.4" rx="1" stroke={accent} strokeWidth={strokeWidth * 0.75} />
      </motion.g>
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.path
          d="M20.63 11.88h.01"
          stroke={accent}
          strokeWidth={2.6}
          initial={false}
          animate={on ? { y: [0, 0, 8.5], opacity: [0, 1, 1, 0] } : { y: 0, opacity: 0 }}
          transition={{ duration: 0.62 / speed, delay: (0.3) / speed, times: [0, 0.2, 1], ease: "easeIn" }}
        />
      </svg>
    </svg>
  );
}
