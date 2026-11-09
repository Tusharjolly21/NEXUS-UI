"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PingPongIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A paddle that swings through a hit and sends the ball off the edge; it drops back in and settles beside the blade. */
export function PingPongIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PingPongIconProps) {
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
        <motion.circle
          cx="19.22"
          cy="19.69"
          r="1.5"
          fill="currentColor"
          stroke="none"
          initial={false}
          animate={on ? { x: [0, 0, 3.96, 3.96, -0.3, 0.08, 0], y: [0, 0, 11.33, 11.33, -0.85, 0.24, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 1.1 / speed, times: [0, 0.155, 0.4, 0.5, 0.74, 0.86, 1], ease: ["linear", "easeOut", "linear", "easeIn", "easeOut", "easeInOut"] }}
        />
      </svg>
      <motion.g
        style={{ originX: "19.41%", originY: "80.59%" }}
        initial={false}
        animate={on ? { rotate: [0, -4, 9.5, 0, 0] } : { rotate: 0 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.1, 0.22, 0.5, 1], ease: ["easeOut", "easeIn", "easeOut", "linear"] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="14.7" cy="9.3" r="6.6" fill={accent} />
        <path d="M9.21 12.96L2.75 17.43L6.57 21.25L11.04 14.79A6.6 6.6 0 0 1 9.21 12.96Z" fill="currentColor" />
        <path d="M7.24 14.85L9.15 16.76M5.66 15.95L8.05 18.34" stroke={accent} strokeWidth={0.9} />
      </motion.g>
    </svg>
  );
}
