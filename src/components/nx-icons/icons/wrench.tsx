"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WrenchIconProps = {
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

/** A spanner that turns a bolt, ratcheting round and back. */
export function WrenchIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WrenchIconProps) {
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
      <motion.g
        style={{ originX: "50%", originY: "30%" }}
        initial={false}
        animate={on ? { rotate: [0, -26, -26, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.35, 0.55, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g transform="rotate(35 12 12)">
          <path d="M9.4 2.6C7.2 3.5 6 5.2 6 7.2c0 1.8 1 3.2 2.6 4v8.2a3.4 3.4 0 0 0 6.8 0v-8.2c1.6-.8 2.6-2.2 2.6-4 0-2-1.2-3.7-3.4-4.6v3.6a2.6 2.6 0 0 1-5.2 0z" />
          <circle cx="12" cy="19.4" r="1.2" fill={accent} stroke="none" />
          <path d="M9.4 2.6v3.6a2.6 2.6 0 0 0 5.2 0V2.6" stroke={accent} />
        </g>
      </motion.g>
    </svg>
  );
}
