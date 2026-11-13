"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TurntableIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The tonearm swings onto the record, the platter spins up, then the arm lifts away. */
export function TurntableIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TurntableIconProps) {
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
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <circle cx="10.5" cy="12" r="4.8" />
      <circle cx="10.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <motion.g
        style={{ originX: "10.5px", originY: "12px" }}
        initial={false}
        animate={on ? { rotate: [0, 720] } : { rotate: 0 }}
        transition={{ duration: 0.85 / speed, delay: (0.2) / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M8.42 10.8A2.4 2.4 0 0 1 11.7 9.92" stroke={accent} strokeWidth={strokeWidth * 0.75} />
      </motion.g>
      <motion.g
        style={{ originX: "18.3px", originY: "8px" }}
        initial={false}
        animate={on ? { rotate: [0, 62, 62, 0] } : { rotate: 0 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.2, 0.68, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M18.3 8V13.9" />
        <circle cx="18.3" cy="8" r="1.5" fill="currentColor" stroke="none" />
      </motion.g>
    </svg>
  );
}
