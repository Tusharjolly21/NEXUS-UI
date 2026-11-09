"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WebcamIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A ball webcam that turns to look, focuses its lens in and out, and blinks its red recording light. */
export function WebcamIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WebcamIconProps) {
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
      <path d="M12 17.5v1.5" />
      <path d="M7 21.5a5 2.5 0 0 1 10 0z" />
      <motion.g
        style={{ originX: "50%", originY: "72.92%" }}
        initial={false}
        animate={on ? { rotate: [0, -10, 7, -3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.25, 0.55, 0.8, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="12" cy="10" r="7.5" />
        <motion.circle
          cx="12"
          cy="10"
          r="2.4"
          stroke={accent}
          strokeWidth={strokeWidth * 0.8}
          style={{ originX: "50%", originY: "41.67%" }}
          initial={false}
          animate={on ? { scale: [1, 1.4, 0.8, 1.12, 1] } : { scale: 1 }}
          transition={{ duration: 0.55 / speed, delay: (on ? 0.4 : 0) / speed }}
        />
        <motion.path
          d="M15.46 6.54h.01"
          stroke="#ff453a"
          strokeWidth={1.8}
          initial={false}
          animate={on ? { opacity: [1, 0.1, 1, 0.1, 1] } : { opacity: 1 }}
          transition={{ duration: 0.65 / speed, delay: (on ? 0.3 : 0) / speed }}
        />
      </motion.g>
    </svg>
  );
}
