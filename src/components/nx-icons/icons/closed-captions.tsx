"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ClosedCaptionsIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffd60a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The two letters roll up and out like a finished caption line, and a fresh pair rolls in from below, one letter after the other. */
export function ClosedCaptionsIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ClosedCaptionsIconProps) {
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
      <path d="M2.8 7.8A2.6 2.6 0 0 1 5.4 5.2L18.6 5.2A2.6 2.6 0 0 1 21.2 7.8L21.2 16.2A2.6 2.6 0 0 1 18.6 18.8L5.4 18.8A2.6 2.6 0 0 1 2.8 16.2Z" />
      <motion.path
        d="M10.53 10.26A2.6 2.6 0 1 0 10.53 13.74"
        stroke={accent}
        initial={false}
        animate={on ? { y: [0, -2.2, 2.2, 0, 0], opacity: [1, 0, 0, 1, 1] } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.38, 0.75, 1], ease: ["easeIn", "linear", "easeOut", "linear"] }}
      />
      <motion.path
        d="M17.73 10.26A2.6 2.6 0 1 0 17.73 13.74"
        stroke={accent}
        initial={false}
        animate={on ? { y: [0, 0, -2.2, 2.2, 0, 0], opacity: [1, 1, 0, 0, 1, 1] } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.1, 0.36, 0.44, 0.8, 1], ease: ["linear", "easeIn", "linear", "easeOut", "linear"] }}
      />
    </svg>
  );
}
