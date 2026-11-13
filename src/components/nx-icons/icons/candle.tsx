"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CandleIconProps = {
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

/** The flame flickers, swelling and leaning in turn above the wick, and settles back to rest. */
export function CandleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CandleIconProps) {
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
      <g transform="translate(0 0.25)">

      <motion.g
        style={{ originX: "50%", originY: "32.5%" }}
        initial={false}
        animate={on ? { scale: [1, 1.12, 0.93, 1.08, 0.97, 1], skewX: [0, 7, -6, 5, -3, 0] } : { scale: 1, skewX: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.2, 0.42, 0.62, 0.82, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 2.5C13.5 4 14.2 4.9 14.2 5.6A2.2 2.2 0 0 1 9.8 5.6C9.8 4.9 10.5 4 12 2.5Z" stroke={accent} />
      </motion.g>
      <path d="M12 12V10.4" />
      <rect x="7.5" y="12" width="9" height="9" rx="1.5" />

      </g>
    </svg>
  );
}
