"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type JumpRopeIconProps = {
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

/** The rope swings from high overhead down to slap the floor, the handles hop as it passes beneath, and it arcs back over the top. */
export function JumpRopeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: JumpRopeIconProps) {
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
      <g transform="translate(0 0.21)">

      <path d="M10.4 21H13.6" />
      <motion.g
        initial={false}
        animate={on ? { y: [0, 0, -1.2, 0, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.5, 0.7, 1], ease: "easeInOut" }}
      >
        <motion.path
          d="M7.8 13.8C7.4 -1.13 16.6 -1.13 16.2 13.8"
          initial={false}
          animate={on ? { d: ["M7.8 13.8C7.4 -1.13 16.6 -1.13 16.2 13.8", "M7.8 13.8C7.4 13.8 16.6 13.8 16.2 13.8", "M7.8 13.8C7.4 23.4 16.6 23.4 16.2 13.8", "M7.8 13.8C7.4 13.8 16.6 13.8 16.2 13.8", "M7.8 13.8C7.4 -1.13 16.6 -1.13 16.2 13.8"] } : { d: "M7.8 13.8C7.4 -1.13 16.6 -1.13 16.2 13.8" }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
        />
        <path d="M7.12 13.98A0.5 0.5 0 0 1 7.8 13.8L7.8 13.8A0.5 0.5 0 0 1 7.98 14.48L5.28 19.16A0.5 0.5 0 0 1 4.6 19.34L4.6 19.34A0.5 0.5 0 0 1 4.42 18.66Z" fill={accent} stroke={accent} />
        <path d="M16.02 14.48A0.5 0.5 0 0 1 16.2 13.8L16.2 13.8A0.5 0.5 0 0 1 16.88 13.98L19.58 18.66A0.5 0.5 0 0 1 19.4 19.34L19.4 19.34A0.5 0.5 0 0 1 18.72 19.16Z" fill={accent} stroke={accent} />
      </motion.g>

      </g>
    </svg>
  );
}
