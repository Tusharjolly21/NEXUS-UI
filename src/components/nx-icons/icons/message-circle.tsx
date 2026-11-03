"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MessageCircleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30b0c7. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A round speech bubble pops from its tail while three dots type in one after another and then ripple. */
export function MessageCircleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MessageCircleIconProps) {
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
        style={{ originX: "16%", originY: "86%" }}
        initial={false}
        animate={on ? { scale: [1, 0.9, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.45 / speed, times: [0, 0.25, 0.7, 1], ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M4.11 14.47A8.4 8.4 0 1 1 9.4 19.59L3.2 20.8Z" />
      </motion.g>
      {[8.4, 12, 15.6].map((x, i) => (
        <motion.circle
          key={x}
          cx={x}
          cy="11.6"
          r="1.1"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { scale: [0, 1.3, 1, 1, 1.5, 1], y: [0, 0, 0, 0, -1.4, 0] } : { scale: 1, y: 0 }}
          transition={{ duration: 1 / speed, delay: (0.2 + i * 0.12) / speed, times: [0, 0.2, 0.32, 0.55, 0.72, 0.9], ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}
