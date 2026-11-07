"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BridgeIconProps = {
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

/** A suspension bridge whose cables draw in from left to right before the deck settles with a small bounce. */
export function BridgeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BridgeIconProps) {
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
        d="M2.5 14.25 7 4.75Q12 16.45 17 4.75L21.5 14.25"
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.6 / speed, ease: "easeInOut" }}
      />
      <path d="M7 4.25V19.75M17 4.25V19.75" />
      <motion.g
        initial={false}
        animate={on ? { y: [0, 0, 0.9, -0.5, 0.25, 0] } : { y: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.5, 0.65, 0.8, 0.9, 1], ease: "easeInOut" }}
      >
        <path d="M2.5 14.25H21.5" />
        {[[9.5, 9.14], [12, 10.6], [14.5, 9.14]].map(([x, y]) => (
          <motion.path
            key={x}
            d={`M${x} ${y}V14.25`}
            stroke={accent}
            strokeWidth={strokeWidth * 0.5}
            initial={false}
            animate={on ? { pathLength: [0, 0, 1] } : { pathLength: 1 }}
            transition={{ duration: 0.8 / speed, times: [0, 0.6, 1], ease: "easeOut" }}
          />
        ))}
      </motion.g>
    </svg>
  );
}
