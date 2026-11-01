"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WalletIconProps = {
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

/** A wallet that catches a coin dropping into it, squashing a little on the landing. */
export function WalletIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WalletIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
      <motion.circle
        cx="11"
        cy="3"
        r="2"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { y: [0, 7], opacity: [1, 1, 0] } : { opacity: 0, y: 0 }}
        transition={on ? { duration: 0.35 / speed, times: [0, 0.8, 1], ease: "easeIn" } : { duration: 0.1 / speed }}
      />
      <motion.g
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1, 0.93, 1.03, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.7 / speed, times: [0, 0.4, 0.5, 0.7, 1], ease: "easeOut" }}
      >
        <path d="M6 7V6a1.5 1.5 0 0 1 1.5-1.5h9" />
        <rect x="3.5" y="7" width="17" height="12.5" rx="2.5" />
        <path d="M20.5 12.2h-4a2 2 0 0 0 0 4h4" />
        <circle cx="16.6" cy="14.2" r="0.6" fill="currentColor" stroke="none" />
      </motion.g>
    </svg>
  );
}
