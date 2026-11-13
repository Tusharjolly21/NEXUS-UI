"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LipstickIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ec4899. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The lipstick twists upward out of its case, holds, then winds back down into it. */
export function LipstickIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LipstickIconProps) {
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
      <g transform="translate(0 -1.12)">

      <motion.path
        d="M9.4 10.8V7.4L14.6 5V10.8"
        stroke={accent}
        initial={false}
        animate={on ? { d: ["M9.4 10.8V7.4L14.6 5V10.8", "M9.4 10.8V5.0L14.6 2.6V10.8", "M9.4 10.8V5.0L14.6 2.6V10.8", "M9.4 10.8V7.4L14.6 5V10.8"] } : { d: "M9.4 10.8V7.4L14.6 5V10.8" }}
        transition={{ duration: 0.9 / speed, times: [0, 0.4, 0.62, 1], ease: "easeInOut" }}
      />
      <path d="M8.2 11.8A1 1 0 0 1 9.2 10.8L14.8 10.8A1 1 0 0 1 15.8 11.8L15.8 14.8L8.2 14.8Z" />
      <rect x="6" y="14.8" width="12" height="6.4" rx="1.5" />

      </g>
    </svg>
  );
}
