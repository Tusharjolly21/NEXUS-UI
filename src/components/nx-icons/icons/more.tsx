"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MoreIconProps = {
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

/** Three dots that hop in a wave, the middle one in colour. */
export function MoreIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MoreIconProps) {
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
      {[5, 12, 19].map((x, i) => (
        <motion.circle
          key={x}
          cx={x}
          cy="12"
          r="1.5"
          fill={i === 1 ? accent : "currentColor"}
          stroke={i === 1 ? accent : "currentColor"}
          initial={false}
          animate={on ? { y: [0, -4, 0] } : { y: 0 }}
          transition={{ duration: 0.4 / speed, delay: (i * 0.1) / speed, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}
