"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HeartPulseIconProps = {
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

/** A heart that beats twice while a heartbeat line draws itself across it. */
export function HeartPulseIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HeartPulseIconProps) {
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
      <g transform="translate(0 -1.0)">
      <motion.g
        style={{ originX: "50%", originY: "55%" }}
        initial={false}
        animate={on ? { scale: [1, 1.1, 1, 1.08, 1] } : { scale: 1 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 20.2C7.2 16.7 3.5 13.6 3.5 9.6A4.1 4.1 0 0 1 7.6 5.5c1.8 0 3.3.9 4.4 2.5 1.1-1.6 2.6-2.5 4.4-2.5a4.1 4.1 0 0 1 4.1 4.1c0 4-3.7 7.1-8.5 10.6z" />
        <motion.path
          d="M7.8 12.4h2.1l1.3-2.6 2.2 5 1.5-3.2.8.8h2.1"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.6 / speed, delay: (on ? 0.1 : 0) / speed, ease: "easeOut" }}
        />
      </motion.g>
      </g>
    </svg>
  );
}
