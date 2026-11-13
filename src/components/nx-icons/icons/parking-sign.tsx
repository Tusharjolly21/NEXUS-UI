"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ParkingSignIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A parking sign that pops while its letter P is drawn stroke by stroke. */
export function ParkingSignIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ParkingSignIconProps) {
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
        animate={on ? { scale: [1, 1.09, 0.97, 1] } : { scale: 1 }}
        transition={{ duration: 0.6 / speed, ease: "easeOut", times: [0, 0.3, 0.65, 1] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
        <motion.path
          d="M8.9 16.5V7.5H12.3a2.8 2.8 0 0 1 0 5.6H8.9"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: [0, 1, 1], opacity: [0, 1, 1] } : { pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.55 / speed, delay: (on ? 0.22 : 0) / speed, ease: "easeInOut", times: [0, 0.1, 1] }}
        />
      </motion.g>
    </svg>
  );
}
