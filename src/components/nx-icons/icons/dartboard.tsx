"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type DartboardIconProps = {
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

/** The lit sector chases round the board, slowing step by step until it clicks back into place. */
export function DartboardIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: DartboardIconProps) {
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
        animate={on ? { rotate: [0, 0, 45, 45, 90, 90, 135, 135, 180, 180, 225, 225, 270, 270, 315, 315, 0, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.05, 0.05, 0.13, 0.13, 0.21, 0.21, 0.29, 0.29, 0.38, 0.38, 0.49, 0.49, 0.62, 0.62, 0.78, 0.78, 1], ease: "linear" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M8.44 3.41A9.3 9.3 0 0 1 15.56 3.41L14.3 6.46A6 6 0 0 0 9.7 6.46Z" fill={accent} stroke="none" />
      </motion.g>
      <circle cx="12" cy="12" r="9.3" />
      <circle cx="12" cy="12" r="6" strokeWidth={strokeWidth * 0.75} />
      <path d="M14.77 13.15L20.59 15.56M13.15 14.77L15.56 20.59M10.85 14.77L8.44 20.59M9.23 13.15L3.41 15.56M9.23 10.85L3.41 8.44M10.85 9.23L8.44 3.41M13.15 9.23L15.56 3.41M14.77 10.85L20.59 8.44" strokeWidth={strokeWidth * 0.75} />
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
