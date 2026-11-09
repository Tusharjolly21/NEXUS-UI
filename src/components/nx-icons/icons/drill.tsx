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
        <rect x="9.95" y="3.81" width="11.4" height="6.8" rx="2.6" />
        <rect x="7.35" y="5.51" width="2.6" height="3.4" rx="0.8" fill="currentColor" />
        <path d="M13.55 10.61 L14.55 16.21 H19.15 L18.15 10.61" />
        <path d="M13.87 12.41 L11.75 12.41" />
        <rect x="11.75" y="16.21" width="9.6" height="4" rx="1.2" />
        <path d="M7.35 7.21 H1.65" strokeWidth={1.7} strokeLinecap="butt" />
        <motion.path
          d="M7.35 7.21 H1.65"
          stroke={accent}
          strokeWidth={1.7}
          strokeLinecap="butt"
          strokeDasharray="1.2 1.1"
          initial={false}
          animate={on ? { strokeDashoffset: [0, -6.9] } : { strokeDashoffset: 0 }}
          transition={{ duration: 0.8 / speed, ease: "linear" }}
        />
      </motion.g>
    </svg>
  );
}
