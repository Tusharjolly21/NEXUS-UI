"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ImportIconProps = {
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

/** An arrow lifts away to the top right, then drops diagonally back into an open tray, which bumps as it lands. */
export function ImportIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ImportIconProps) {
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
        d="M3.5 11v7a2.5 2.5 0 0 0 2.5 2.5h12a2.5 2.5 0 0 0 2.5-2.5v-7"
        initial={false}
        animate={on ? { y: [0, 0, 1.3, -0.3, 0] } : { y: 0 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.6, 0.7, 0.85, 1], ease: "easeInOut" }}
      />
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.g
          initial={false}
          animate={on ? { x: [0, 14, 14, -0.9, 0], y: [0, -14, -14, 0.9, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.85 / speed, times: [0, 0.21, 0.28, 0.6, 1], ease: ["easeIn", "linear", "easeIn", "easeOut"] }}
        >
          <path d="M19 3.5 9.5 13" stroke={accent} />
          <path d="M9.5 7.5V13H15" stroke={accent} />
        </motion.g>
      </svg>
    </svg>
  );
}
