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

/** A paddle that pops up and smacks the ball away; it drops back and bounces on the paddle before settling. */
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
          cx="11.88"
          cy="3.65"
          r="1.7"
          fill="currentColor"
          stroke="none"
          initial={false}
          animate={on ? { y: [0, 0, -16, -16, 1.15, -1.2, 0] } : { y: 0 }}
          transition={{ duration: 1.1 / speed, times: [0, 0.155, 0.4, 0.5, 0.74, 0.86, 1], ease: ["linear", "easeOut", "linear", "easeIn", "easeOut", "easeInOut"] }}
        />
      </svg>
      <motion.g
        style={{ originX: "49.5%", originY: "53.54%" }}
        initial={false}
        animate={on ? { y: [0, 0, -1.2, 0, 0], rotate: [0, 0, -9, 0, 0] } : { y: 0, rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.08, 0.19, 0.45, 1], ease: ["linear", "easeIn", "easeOut", "linear"] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12.25 18.24L13.47 20.53A1 1 0 0 0 14.83 20.95L16.94 19.82A1 1 0 0 0 17.36 18.47L16.14 16.17" />
        <circle cx="11.88" cy="12.85" r="5.4" fill={accent} fillOpacity={0.3} />
      </motion.g>
    </svg>
  );
}
