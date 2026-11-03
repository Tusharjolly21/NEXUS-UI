"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CloudLightningIconProps = {
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

/** A storm cloud that flickers and shudders as a lightning bolt strikes down from it, flashing twice. */
export function CloudLightningIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CloudLightningIconProps) {
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
        initial={false}
        animate={on ? { x: [0, -0.5, 0.6, -0.4, 0.3, 0] } : { x: 0 }}
        transition={{ duration: 0.8 / speed, delay: (0.1) / speed }}
      >
        <motion.path
          d="M7 14.8a3.8 3.8 0 0 1-.5-7.5A5.2 5.2 0 0 1 16.6 8.5a3.3 3.3 0 0 1 .6 6.3z"
          initial={false}
          animate={on ? { opacity: [1, 0, 1, 0.1, 1] } : { opacity: 1 }}
          transition={{ duration: 0.8 / speed, delay: (0.1) / speed, times: [0, 0.2, 0.45, 0.7, 1] }}
        />
        <motion.path
          d="M7 14.8a3.8 3.8 0 0 1-.5-7.5A5.2 5.2 0 0 1 16.6 8.5a3.3 3.3 0 0 1 .6 6.3z"
          stroke={accent}
          initial={false}
          animate={on ? { opacity: [0, 1, 0, 0.9, 0] } : { opacity: 0 }}
          transition={{ duration: 0.8 / speed, delay: (0.1) / speed, times: [0, 0.2, 0.45, 0.7, 1] }}
        />
      </motion.g>
      <motion.path
        d="M13.6 15.2 9.8 18.9h2.3l-1.2 2.7 4-4.2h-2.3z"
        fill={accent}
        stroke={accent}
        strokeWidth={1}
        style={{ originX: "50%", originY: "0%" }}
        initial={false}
        animate={on ? { scaleY: [0, 1, 1, 1, 1, 1], opacity: [0, 1, 0.25, 1, 0.4, 1] } : { scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.8 / speed, delay: (0.1) / speed, times: [0, 0.15, 0.35, 0.55, 0.75, 1], ease: "easeOut" }}
      />
    </svg>
  );
}
