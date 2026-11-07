"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PenNibIconProps = {
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

/** A calligraphy nib that dips onto the page and then writes a looping flourish, the ink line drawing in behind it. */
export function PenNibIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PenNibIconProps) {
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
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
      <motion.path
        d="M3.1 17C4.1 13.6 6.9 12.2 8.3 14.8C9.3 16.8 10.7 18.8 12.9 18.6"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [1, 0.8, 0.61, 0.41, 0.22, 0.02, 0.02, 0.02, 0.08, 0.17, 0.25, 0.33, 0.42, 0.5, 0.58, 0.67, 0.75, 0.83, 0.92, 1] } : { pathLength: 1 }}
        transition={{ duration: 1.3 / speed, times: [0, 0.04, 0.08, 0.12, 0.16, 0.2, 0.28, 0.36, 0.37, 0.41, 0.46, 0.53, 0.6, 0.68, 0.76, 0.83, 0.9, 0.95, 0.99, 1], ease: "linear" }}
      />
      <motion.g
        initial={false}
        animate={on ? { x: [0, -2.19, -4.35, -5.85, -8.8, -9.8, -9.8, -9.8, -9.39, -8.8, -8.01, -6.99, -5.85, -4.94, -4.35, -3.76, -3.05, -2.19, -1.15, 0], y: [0, -0.61, -3.32, -5.02, -3.69, -1.6, -4.6, -1.6, -2.69, -3.69, -4.54, -5.08, -5.02, -4.32, -3.32, -2.32, -1.39, -0.61, -0.1, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 1.3 / speed, times: [0, 0.04, 0.08, 0.12, 0.16, 0.2, 0.28, 0.36, 0.37, 0.41, 0.46, 0.53, 0.6, 0.68, 0.76, 0.83, 0.9, 0.95, 0.99, 1], ease: ["linear", "linear", "linear", "linear", "linear", "easeOut", "easeIn", "linear", "linear", "linear", "linear", "linear", "linear", "linear", "linear", "linear", "linear", "linear", "linear"] }}
      >
        <g transform="translate(12.9 18.6) rotate(25) translate(-12 -20.6)">
          <path d="M12 20.6C10 18.2 7.8 15.4 7.8 12.4C7.8 10 8.9 8.4 9.4 7.2H14.6C15.1 8.4 16.2 10 16.2 12.4C16.2 15.4 14 18.2 12 20.6z" />
          <path d="M12 13.8V20.6" />
          <circle cx="12" cy="12.2" r="1.3" fill={accent} stroke="none" />
        </g>
      </motion.g>
      </svg>
    </svg>
  );
}
