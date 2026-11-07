"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SecurityCameraIconProps = {
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

/** A wall mounted camera pans left and right on its bracket while a red recording light blinks. */
export function SecurityCameraIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SecurityCameraIconProps) {
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
      <path d="M21 4.5V19.5M21 12H17" />
      <motion.g
        style={{ originX: "70.83%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 8, -8, 5, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.25, 0.6, 0.85, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g transform="rotate(-14 17 12)">
          <rect x="6" y="9" width="11" height="6" rx="2" />
          <path d="M6 9.8H4.4a1.4 1.4 0 0 0-1.4 1.4v1.6a1.4 1.4 0 0 0 1.4 1.4H6" stroke={accent} />
          <motion.circle
            cx="14"
            cy="12"
            r="1"
            fill="#ff3b30"
            stroke="none"
            initial={false}
            animate={on ? { opacity: [1, 0.12, 1, 0.12, 1, 0.12, 1] } : { opacity: 1 }}
            transition={{ duration: 1 / speed, ease: "linear" }}
          />
        </g>
      </motion.g>
    </svg>
  );
}
