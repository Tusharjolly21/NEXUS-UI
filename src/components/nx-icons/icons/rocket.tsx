"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RocketIconProps = {
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

/** A rocket that shakes, lights its engine, shoots off the top of the icon and lands back where it started. */
export function RocketIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RocketIconProps) {
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
        animate={on ? { y: [0, 0, -26, 24, 0], x: [0, -0.6, 0.6, -0.6, 0.6, 0], opacity: [1, 1, 0, 0, 1] } : { y: 0, x: 0, opacity: 1 }}
        transition={{
          y: { duration: 1.6 / speed, times: [0, 0.28, 0.5, 0.51, 0.85], ease: "easeInOut" },
          opacity: { duration: 1.6 / speed, times: [0, 0.28, 0.5, 0.51, 0.85] },
          x: { duration: 0.35 / speed, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
        }}
      >
        <path d="M12 2.5c3 2.4 4.5 5.6 4.5 9.5v4h-9v-4c0-3.9 1.5-7.1 4.5-9.5z" />
        <circle cx="12" cy="9.2" r="1.7" />
        <path d="M7.5 13.5 5 17v2l3.5-1.5M16.5 13.5 19 17v2l-3.5-1.5" />
        <motion.path
          d="M10 19c0 1.7.8 2.9 2 3.6 1.2-.7 2-1.9 2-3.6"
          stroke={accent}
          style={{ originX: "50%", originY: "0%" }}
          initial={false}
          animate={on ? { scaleY: [1, 1.5, 0.8, 1.5, 1] } : { scaleY: 0.6 }}
          transition={on ? { duration: 0.3 / speed, repeat: 4 } : { duration: 0.2 / speed }}
        />
      </motion.g>
    </svg>
  );
}
