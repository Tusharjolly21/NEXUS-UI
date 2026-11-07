"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MetronomeIconProps = {
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

/** The pendulum of a metronome swings left and right with its weight, in a steady beat. */
export function MetronomeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MetronomeIconProps) {
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
      <path d="M7.6 5h8.8L19.5 21H4.5z" />
      <motion.g
        style={{ originX: "50%", originY: "70.83%" }}
        initial={false}
        animate={on ? { rotate: [0, 12, -12, 12, -12, 0] } : { rotate: 0 }}
        transition={{ duration: 1.2 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 17V2.8" />
        <rect x="10.3" y="8" width="3.4" height="2.6" rx="0.8" fill={accent} stroke="none" />
      </motion.g>
      <circle cx="12" cy="17" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}
