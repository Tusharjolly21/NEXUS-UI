"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LogOutIconProps = {
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

/** An arrow that slips out through the doorway and fades, then drifts back to the door. */
export function LogOutIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LogOutIconProps) {
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
      <motion.path
        d="M10 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H10"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [1, 0.35, 1] } : { opacity: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.15, 0.5] }}
      />
      <motion.g
        initial={false}
        animate={on ? { x: [0, 4, -3, 0], opacity: [1, 0, 0, 1] } : { x: 0, opacity: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.35, 0.5, 0.9], ease: "easeInOut" }}
      >
        <path d="M11.5 12h9" />
        <path d="M17 8.5l3.5 3.5-3.5 3.5" />
      </motion.g>
    </svg>
  );
}
