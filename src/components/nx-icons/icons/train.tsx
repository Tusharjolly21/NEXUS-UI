"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TrainIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A train that pulls in from the distance, headlights alternating and the window catching a glint. */
export function TrainIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TrainIconProps) {
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
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scale: [0.84, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 0.5 / speed, times: [0, 0.7, 1], ease: "easeOut" }}
      >
        <rect x="5" y="3" width="14" height="15" rx="3" />
        <rect x="8" y="6.5" width="8" height="5" rx="1.2" />
        <motion.path
          d="M10 10l1.4-2.2"
          stroke={accent}
          initial={false}
          animate={on ? { x: [0, 3.4], opacity: [0, 1, 0] } : { opacity: 0 }}
          transition={{ duration: 0.5 / speed, delay: (0.3) / speed }}
        />
        <motion.path
          d="M8.6 14.8h.01M15.4 14.8h.01"
          stroke={accent}
          strokeWidth={2.6}
          initial={false}
          animate={on ? { opacity: [1, 0.25, 1, 0.25, 1] } : { opacity: 1 }}
          transition={{ duration: 0.6 / speed }}
        />
        <path d="M8 18l-2 3.5M16 18l2 3.5" />
      </motion.g>
    </svg>
  );
}
