"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BananaIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffcc00. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A banana rocks back and forth on its curved belly like a rocking chair and comes to rest. */
export function BananaIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BananaIconProps) {
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
      <g transform="translate(-0.04 3.09)">

      <motion.g
        style={{ originX: "50%", originY: "27.5%" }}
        initial={false}
        animate={on ? { rotate: [0, -7, 6, -3.5, 1.5, 0], x: [0, -1.05, 0.9, -0.53, 0.23, 0] } : { rotate: 0, x: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.2, 0.42, 0.62, 0.82, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3.42 7.17A8.6 8.6 0 1 0 20.47 5.1L18.23 4.58A8.17 8.17 0 0 1 3.42 7.17Z" fill={accent} />
        <path d="M16.79 10.77A6.35 6.35 0 0 1 11.89 12.95" strokeWidth={strokeWidth * 0.75} />
        <path d="M19.35 4.84 L18.96 2.67" />
      </motion.g>

      </g>
    </svg>
  );
}
