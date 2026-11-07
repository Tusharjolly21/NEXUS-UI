"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BombIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff453a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A round bomb that jiggles while its fuse burns down and the spark at the tip fizzes. */
export function BombIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BombIconProps) {
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
        style={{ originX: "43%", originY: "62%" }}
        initial={false}
        animate={on ? { rotate: [0, -3, 3, -3, 3, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="10.4" cy="15" r="6.5" />
        <path d="M6.46 14.31A4 4 0 0 1 8.71 11.37" stroke={accent} strokeWidth={1.4} />
        <path d="M13.45 9.26L14.3 7.67L16.94 9.89L15.52 11" />
        <motion.path
          d="M15.62 8.78 C15.6 5.4 19.6 6.6 18.9 3.4"
          initial={false}
          animate={on ? { pathLength: [1, 0.8, 0.6, 0.4, 0.2, 1, 1] } : { pathLength: 1 }}
          transition={{ duration: 1 / speed, times: [0, 0.16, 0.32, 0.48, 0.64, 0.8, 1], ease: "linear" }}
        />
        <motion.g
          initial={false}
          animate={on ? { x: [0, -0.02, -0.92, -2.09, -3, 0, 0], y: [0, 1.34, 2.34, 3.05, 4.04, 0, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.16, 0.32, 0.48, 0.64, 0.8, 1], ease: "linear" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <motion.path
            d="M19.6 3.4 L20.4 3.4 M19.25 4.01 L19.65 4.7 M18.55 4.01 L18.15 4.7 M18.2 3.4 L17.4 3.4 M18.55 2.79 L18.15 2.1 M19.25 2.79 L19.65 2.1"
            stroke={accent}
            strokeWidth={1.1}
            style={{ originX: "78.75%", originY: "14.17%" }}
            initial={false}
            animate={on ? { rotate: [0, 45, 0, 45, 0, 45, 0], scale: [1, 1.2, 0.7, 1.2, 0.7, 1.2, 1] } : { rotate: 0, scale: 1 }}
            transition={{ duration: 1 / speed, ease: "linear" }}
          />
          <circle cx="18.9" cy="3.4" r="0.7" fill={accent} stroke="none" />
        </motion.g>
      </motion.g>
    </svg>
  );
}
