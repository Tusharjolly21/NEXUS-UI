"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type EyeOffIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An eye that blinks shut while a slash is drawn across it, hiding what it sees. */
export function EyeOffIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: EyeOffIconProps) {
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
        d="M4.5 4.5l15 15"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.35 / speed, delay: (on ? 0.2 : 0) / speed, ease: "easeOut" }}
      />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleY: [1, 0.12, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.45 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M2.8 12C5 8 8.3 6.2 12 6.2S19 8 21.2 12C19 16 15.7 17.8 12 17.8S5 16 2.8 12z" />
        <circle cx="12" cy="12" r="2.4" />
      </motion.g>
    </svg>
  );
}
