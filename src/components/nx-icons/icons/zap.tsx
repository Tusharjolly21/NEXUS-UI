"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ZapIconProps = {
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

/** A lightning bolt that flashes yellow twice, with sparks flying off it. */
export function ZapIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ZapIconProps) {
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
        animate={on ? { x: [0, -0.8, 0.8, -0.5, 0.5, 0] } : { x: 0 }}
        transition={{ duration: 0.7 / speed }}
      >
        <motion.path
          d="M13.2 2.8 5 13.2h6.2L10.4 21.2 19 10.4h-6.2z"
          fill={accent}
          initial={false}
          animate={on ? { fillOpacity: [0, 1, 0.15, 1, 0.4] } : { fillOpacity: 0 }}
          transition={{ duration: 0.7 / speed }}
        />
      </motion.g>
      <motion.path
        d="M19.6 4.4l-1.3 1.3M21.6 8.2h-1.8M4.4 5.2l1.3 1.3"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 1, 0, 1, 0], scale: [0.6, 1.1, 0.8, 1.1, 0.8] } : { opacity: 0 }}
        transition={{ duration: 0.7 / speed }}
      />
    </svg>
  );
}
