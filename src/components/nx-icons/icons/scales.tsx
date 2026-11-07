"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ScalesIconProps = {
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

/** Balance scales whose beam tips one way, then the other, and settles level with the pans swinging plumb beneath it. */
export function ScalesIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ScalesIconProps) {
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
      <path d="M12 4V20M8 20H16" />
      <motion.g
        initial={false}
        animate={on ? { x: [0, 0.12, 0.06, 0.02, 0, 0], y: [0, -1.2, 0.88, -0.55, 0.22, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 1.4 / speed, ease: "easeInOut" }}
      >
        <path d="M5.7 7.5 2.5 15M5.7 7.5 8.9 15M2.5 15a4 4 0 0 0 6.4 0" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { x: [0, -0.12, -0.06, -0.02, 0, 0], y: [0, 1.2, -0.88, 0.55, -0.22, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 1.4 / speed, ease: "easeInOut" }}
      >
        <path d="M18.3 7.5 15.1 15M18.3 7.5 21.5 15M15.1 15a4 4 0 0 0 6.4 0" />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "31.25%" }}
        initial={false}
        animate={on ? { rotate: [0, 11, -8, 5, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 1.4 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M5.7 7.5H18.3" stroke={accent} />
      </motion.g>
    </svg>
  );
}
