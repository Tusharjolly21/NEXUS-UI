"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SandwichIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A sandwich whose top slice, lettuce and cheese lift apart one after another and settle back down. */
export function SandwichIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SandwichIconProps) {
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
        <motion.g
          initial={false}
          animate={on ? { y: [0, -1.8, -1.8, 0.15, 0] } : { y: 0 }}
          transition={{ duration: 0.95 / speed, times: [0, 0.28, 0.55, 0.82, 1], ease: "easeInOut" }}
        >
          <path d="M4.9 9.35V7.15C2.8 7.35 2.9 3.05 7.3 3.05H16.7C21.1 3.05 21.2 7.35 19.1 7.15V9.35Z" />
        </motion.g>
        <motion.path
          d="M3.22 12.15q0.97 -1.5 1.95 0t1.95 0t1.95 0t1.95 0t1.95 0t1.95 0t1.95 0t1.95 0t1.95 0"
          stroke={accent}
          strokeWidth={strokeWidth * 0.75}
          initial={false}
          animate={on ? { d: ["M3.22 12.15q0.97 -1.5 1.95 0t1.95 0t1.95 0t1.95 0t1.95 0t1.95 0t1.95 0t1.95 0t1.95 0", "M3.22 12.15q0.97 1.5 1.95 0t1.95 0t1.95 0t1.95 0t1.95 0t1.95 0t1.95 0t1.95 0t1.95 0", "M3.22 12.15q0.97 -1.5 1.95 0t1.95 0t1.95 0t1.95 0t1.95 0t1.95 0t1.95 0t1.95 0t1.95 0"], y: [0, -0.8, 0.2, 0] } : { d: "M3.22 12.15q0.97 -1.5 1.95 0t1.95 0t1.95 0t1.95 0t1.95 0t1.95 0t1.95 0t1.95 0t1.95 0", y: 0 }}
          transition={{ d: { duration: 0.7 / speed, delay: (0.1) / speed, ease: "easeInOut" }, y: { duration: 0.6 / speed, delay: (0.1) / speed, times: [0, 0.4, 0.8, 1], ease: "easeInOut" } }}
        />
        <motion.path
          d="M5.3 15.15H18.7"
          strokeWidth={strokeWidth * 0.75}
          initial={false}
          animate={on ? { y: [0, -0.4, 0.1, 0] } : { y: 0 }}
          transition={{ duration: 0.55 / speed, delay: (0.2) / speed, times: [0, 0.4, 0.8, 1], ease: "easeInOut" }}
        />
        <path d="M4.9 17.45H19.1V18.95C19.1 20.35 18.3 20.95 17.1 20.95H6.9C5.7 20.95 4.9 20.35 4.9 18.95Z" />
      </svg>
    </svg>
  );
}
