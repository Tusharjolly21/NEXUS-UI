"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HandFistIconProps = {
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

/** The fist pulls back and punches toward you, impact lines flashing on both sides before it settles. */
export function HandFistIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HandFistIconProps) {
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
      <g transform="translate(0 -0.1)">

      <motion.path
        d="M2.49 15.19L1.54 15.5M2 12.1L1 12.1M2.49 9.01L1.54 8.7M21.51 9.01L22.46 8.7M22 12.1L23 12.1M21.51 15.19L22.46 15.5"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 0, 1, 1, 0, 0] } : { opacity: 0 }}
        transition={{ duration: 0.75 / speed, times: [0, 0.36, 0.42, 0.56, 0.8, 1], ease: "easeOut" }}
      />
      <motion.g
        style={{ originX: "50%", originY: "50.42%" }}
        initial={false}
        animate={on ? { scale: [1, 0.9, 1.05, 0.98, 1] } : { scale: 1 }}
        transition={{ duration: 0.75 / speed, times: [0, 0.3, 0.42, 0.68, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M5.6 6.6A1.6 1.6 0 0 1 8.8 6.6A1.6 1.6 0 0 1 12 6.6A1.6 1.6 0 0 1 15.2 6.6A1.6 1.6 0 0 1 18.4 6.6L18.4 6.6L18.4 14.31A2.6 2.6 0 0 1 18.06 15.6L16.46 18.39A1.6 1.6 0 0 1 15.07 19.2L8.93 19.2A1.6 1.6 0 0 1 7.54 18.39L5.94 15.6A2.6 2.6 0 0 1 5.6 14.31L5.6 6.6Z" />
        <path d="M8.8 6.6V10.8M12 6.6V10.8M15.2 6.6V11.34" />
        <path d="M5.6 10.8H14A1.6 1.6 0 0 1 14 14H5.6" />
      </motion.g>
      </g>
    </svg>
  );
}
