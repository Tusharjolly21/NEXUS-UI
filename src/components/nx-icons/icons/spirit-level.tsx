"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SpiritLevelIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The level rocks off true and its bubble slides to the high end, then both settle dead centre. */
export function SpiritLevelIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SpiritLevelIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, -7, 5, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.3, 0.6, 0.8, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <rect x="2.5" y="7.5" width="19" height="9" rx="2" />
        <path d="M8 7.5V16.5M16 7.5V16.5" />
        <motion.circle
          cx="12"
          cy="12"
          r="1.2"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { x: [0, 2.2, -1.6, 0.7, 0] } : { x: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.3, 0.6, 0.8, 1], ease: "easeInOut" }}
        />
      </motion.g>
    </svg>
  );
}
