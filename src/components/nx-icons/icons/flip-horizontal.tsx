"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FlipHorizontalIconProps = {
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

/** The tinted triangle flips over the dotted mirror line onto its twin, pauses there and flips back. */
export function FlipHorizontalIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FlipHorizontalIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleX: [1, -1, -1, 1] } : { scaleX: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.4, 0.6, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M7.29 9.42A1 1 0 0 1 9.2 9.84L9.2 17.7A1 1 0 0 1 8.2 18.7L4.56 18.7A1 1 0 0 1 3.66 17.28Z" stroke={accent} fill={accent} fillOpacity={0.25} />
      </motion.g>
      <path d="M16.71 9.42A1 1 0 0 0 14.8 9.84L14.8 17.7A1 1 0 0 0 15.8 18.7L19.44 18.7A1 1 0 0 0 20.34 17.28Z" />
      <path d="M12 3.3V20.7" strokeDasharray="0 3.48" />
    </svg>
  );
}
