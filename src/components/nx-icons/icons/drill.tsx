"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type DrillIconProps = {
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

/** A cordless drill whose bit spins in blurred stripes while the whole body shudders. */
export function DrillIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: DrillIconProps) {
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
        animate={on ? { x: [0, -0.45, 0.4, -0.4, 0.35, -0.3, 0.3, -0.2, 0.15, 0], y: [0, 0.12, -0.1, 0.12, -0.1, 0.1, -0.08, 0.06, -0.04, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.8 / speed, ease: "linear" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M6.8 7.1H2.4" strokeWidth={strokeWidth * 0.8} />
        <motion.path
          d="M6.8 7.1H2.4"
          stroke={accent}
          strokeWidth={strokeWidth * 0.8}
          strokeLinecap="butt"
          strokeDasharray="1.1 1.1"
          initial={false}
          animate={on ? { strokeDashoffset: [0, -8.8] } : { strokeDashoffset: 0 }}
          transition={{ duration: 0.8 / speed, ease: "linear" }}
        />
        <rect x="6.8" y="5.4" width="3.6" height="3.4" rx="0.9" fill="currentColor" stroke="none" />
        <rect x="10" y="3.8" width="11.3" height="6.6" rx="2.4" />
        <path d="M13.6 10.4L14.6 16.2M18.2 10.4L19.2 16.2" />
        <path d="M14.08 13.2H11.9" />
        <rect x="11.7" y="16.2" width="9.6" height="4" rx="1.2" />
      </motion.g>
    </svg>
  );
}
