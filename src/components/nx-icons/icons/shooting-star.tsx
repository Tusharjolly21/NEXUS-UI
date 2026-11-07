"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ShootingStarIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffd60a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A star that streaks in from the corner trailing three lines, then twinkles. */
export function ShootingStarIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ShootingStarIconProps) {
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
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.g
          initial={false}
          animate={on ? { x: [11, 0], y: [-9, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.55 / speed, ease: "easeOut" }}
        >
          <motion.path
            d="M11.9 16.08L6.07 19.18"
            initial={false}
            animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
            transition={{ duration: 0.4 / speed, delay: (on ? 0.1 : 0) / speed }}
          />
          <motion.path
            d="M11.4 12.84L2.75 17.44"
            initial={false}
            animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
            transition={{ duration: 0.4 / speed, delay: (on ? 0.16 : 0) / speed }}
          />
          <motion.path
            d="M8.8 10.71L4.47 13.01"
            initial={false}
            animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
            transition={{ duration: 0.4 / speed, delay: (on ? 0.22 : 0) / speed }}
          />
          <motion.g
            style={{ originX: "69.1%", originY: "42.0%" }}
            initial={false}
            animate={on ? { scale: [1, 0.7, 1.28, 0.92, 1.12, 1], rotate: [0, 0, 0, 0, 0, 0] } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.55, 0.7, 0.85, 1], ease: "easeInOut" }}
          >
            <rect width="24" height="24" fill="none" stroke="none" />
            <path d="M15.47 4.8L17.69 7.61L21.27 7.38L19.28 10.36L20.6 13.69L17.15 12.72L14.39 15.01L14.25 11.43L11.22 9.52L14.58 8.27Z" stroke={accent} fill={accent} fillOpacity={0.28} />
          </motion.g>
        </motion.g>
      </svg>
    </svg>
  );
}
