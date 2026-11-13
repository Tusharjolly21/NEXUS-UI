"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type StopSignIconProps = {
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

/** A stop sign that rocks on its pole as the red bar flashes twice. */
export function StopSignIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: StopSignIconProps) {
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
        style={{ originX: "50%", originY: "89.58%" }}
        initial={false}
        animate={on ? { rotate: [0, -7, 5, -3, 1.2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut", times: [0, 0.2, 0.45, 0.65, 0.85, 1] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M8.5 9.5 H15.5"
          stroke={accent}
          initial={false}
          animate={on ? { opacity: [1, 0.15, 1, 0.15, 1] } : { opacity: 1 }}
          transition={{ duration: 0.9 / speed, ease: "linear" }}
        />
        <path d="M19 12.4L14.9 16.5L9.1 16.5L5 12.4L5 6.6L9.1 2.5L14.9 2.5L19 6.6Z" />
        <path d="M12 16.5 V21.5" />
      </motion.g>
    </svg>
  );
}
