"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ViolinIconProps = {
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

/** A bow draws back and forth across the strings while the violin body hums with each stroke. */
export function ViolinIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ViolinIconProps) {
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
      <g transform="translate(0.99 -0.99)">
      <g transform="rotate(45 12 12)">
        <motion.path
          d="M5.5 19.3H18.5"
          stroke={accent}
          initial={false}
          animate={on ? { x: [0, -3, 2.8, -2.2, 0] } : { x: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.25, 0.55, 0.8, 1], ease: "easeInOut" }}
        />
        <motion.g
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1.04, 0.99, 1.03, 1] } : { scale: 1 }}
          transition={{ duration: 1 / speed, times: [0, 0.25, 0.55, 0.8, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12 9.26 C14.28 9.26 15.76 10.4 15.76 12.23 C15.76 13.82 14.85 14.51 14.85 15.88 C14.85 17.24 16.56 17.7 16.56 20.21 C16.56 22.49 14.51 23.63 12 23.63 C9.49 23.63 7.44 22.49 7.44 20.21 C7.44 17.7 9.15 17.24 9.15 15.88 C9.15 14.51 8.24 13.82 8.24 12.23 C8.24 10.4 9.72 9.26 12 9.26z" />
          <path d="M12 9.26V1.97" />
          <circle cx="12" cy="1.97" r="1.9" fill="currentColor" stroke="none" />
          <path d="M12 9.26V23.63" strokeWidth={strokeWidth * 0.6} />
        </motion.g>
      </g>
      </g>
    </svg>
  );
}
