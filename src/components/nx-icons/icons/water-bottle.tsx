"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WaterBottleIconProps = {
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

/** A water bottle tips while the water inside sloshes from side to side and settles flat. */
export function WaterBottleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WaterBottleIconProps) {
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
      <g transform="translate(0 0.33)">
      <motion.g style={{ originX: "50%", originY: "85.42%" }} initial={false} animate={on ? { rotate: [0, 7, -4, 0] } : { rotate: 0 }} transition={{ duration: 0.9 / speed, times: [0, 0.2, 0.5, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M10 2.9H14A1 1 0 0 1 15 3.9V5.5A1 1 0 0 1 14 6.5H10A1 1 0 0 1 9 5.5V3.9A1 1 0 0 1 10 2.9Z"  />
      <path d="M10 6.5V7.8C10 9 7 9 7 11.8V18A2.5 2.5 0 0 0 9.5 20.5H14.5A2.5 2.5 0 0 0 17 18V11.8C17 9 14 9 14 7.8V6.5"  />
      <motion.g style={{ originX: "50%", originY: "65%" }} initial={false} animate={on ? { rotate: [0, -16, 13, -8, 4, 0] } : { rotate: 0 }} transition={{ duration: 0.9 / speed, times: [0, 0.2, 0.42, 0.62, 0.82, 1], ease: "easeInOut", delay: (0.05) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M9.4 15.6q1.3-2.1 2.6 0t2.6 0" stroke={accent} />
      </motion.g>
      </motion.g>
      </g>
    </svg>
  );
}
