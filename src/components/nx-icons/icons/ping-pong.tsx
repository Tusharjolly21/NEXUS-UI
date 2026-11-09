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
          cx="18.23"
          cy="19.66"
          r="1.9"
          fill="currentColor"
          stroke="none"
          initial={false}
          animate={on ? { x: [0, 0, 7.98, 7.98, -0.42, 0.12, 0], y: [0, 0, 15.01, 15.01, -0.79, 0.22, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 1.1 / speed, times: [0, 0.155, 0.4, 0.5, 0.74, 0.86, 1], ease: ["linear", "easeOut", "linear", "easeIn", "easeOut", "easeInOut"] }}
        />
      </svg>
      <motion.g
        style={{ originX: "27.75%", originY: "78.25%" }}
        initial={false}
        animate={on ? { rotate: [0, -5, 13, 0, 0] } : { rotate: 0 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.1, 0.22, 0.5, 1], ease: ["easeOut", "easeIn", "easeOut", "linear"] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="12.97" cy="9.77" r="6.4" fill={accent} fillOpacity={0.3} />
        <path d="M11.22 15.93 L9.81 19.52 Q9.12 20.5 8.14 19.81 L5.19 17.75 Q4.2 17.06 4.89 16.08 L7.78 13.52 Z" fill="currentColor" />
        <path d="M9.18 10.1 A3.8 3.8 0 0 0 13.95 13.44" stroke={accent} strokeWidth={strokeWidth * 0.75} />
      </motion.g>
    </svg>
  );
}
