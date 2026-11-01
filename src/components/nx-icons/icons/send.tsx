"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SendIconProps = {
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

/** A paper plane that takes off, leaves a trail and flies back in for the next message. */
export function SendIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SendIconProps) {
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
        d="M2 15.8h4M3.4 19.2h3.6"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 1, 0], x: [4, 0, -2] } : { opacity: 0, x: 0 }}
        transition={{ duration: 0.5 / speed, times: [0, 0.3, 1], delay: (0.02) / speed }}
      />
      <motion.g
        initial={false}
        animate={on ? { x: [0, 16, -16, 0], y: [0, -16, 16, 0], opacity: [1, 0, 0, 1] } : { x: 0, y: 0, opacity: 1 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.38, 0.4, 0.85], ease: "easeInOut" }}
      >
        <path d="M21 3 3 10.2l7.4 2.6L13 20.5z" />
        <path d="M10.4 12.8 21 3" />
      </motion.g>
    </svg>
  );
}
