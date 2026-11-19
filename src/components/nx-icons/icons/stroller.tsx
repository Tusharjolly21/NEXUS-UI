"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type StrollerIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #34c759. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The pram bounces gently on its springs as if being rocked, the legs flexing over the still wheels. */
export function StrollerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: StrollerIconProps) {
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
      <g transform="translate(-0.64 -0.54)">

      <motion.path
        d="M7.9 13.53L7.9 16.9M15.9 13.53L15.9 16.9"
        initial={false}
        animate={on ? { d: ["M7.9 13.53L7.9 16.9M15.9 13.53L15.9 16.9", "M7.9 14.43L7.9 16.9M15.9 14.43L15.9 16.9", "M7.9 13.08L7.9 16.9M15.9 13.08L15.9 16.9", "M7.9 14.03L7.9 16.9M15.9 14.03L15.9 16.9", "M7.9 13.38L7.9 16.9M15.9 13.38L15.9 16.9", "M7.9 13.53L7.9 16.9M15.9 13.53L15.9 16.9"] } : { d: "M7.9 13.53L7.9 16.9M15.9 13.53L15.9 16.9" }}
        transition={{ duration: 1 / speed, times: [0, 0.2, 0.42, 0.62, 0.82, 1], ease: "easeInOut" }}
      />
      <circle cx="7.9" cy="19.2" r="2.3" />
      <circle cx="15.9" cy="19.2" r="2.3" />
      <motion.g
        initial={false}
        animate={on ? { y: [0, 0.9, -0.45, 0.5, -0.15, 0] } : { y: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.2, 0.42, 0.62, 0.82, 1], ease: "easeInOut" }}
      >
        <path d="M5.3 10.2A6.6 6.6 0 0 1 11.9 3.6V10.2" stroke={accent} />
        <path d="M4.7 10.2H19.1A7.2 4 0 0 1 4.7 10.2" />
        <path d="M19.1 10.2L20.6 5.2" />
      </motion.g>
      </g>
    </svg>
  );
}
