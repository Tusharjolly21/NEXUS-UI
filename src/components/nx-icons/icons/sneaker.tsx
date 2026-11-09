"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SneakerIconProps = {
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

/** A sneaker that taps twice, tilting on its toe, while its stripe draws itself in. */
export function SneakerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SneakerIconProps) {
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
        style={{ originX: "85.42%", originY: "77.5%" }}
        initial={false}
        animate={on ? { rotate: [0, 9, 0, 6, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.28, 0.5, 0.76, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3.3 18.6L20.5 18.6" />
        <path d="M4.1 15.6L4.1 8.8C4.1 7.2 5.1 6.6 6.3 7L8.5 7.8C8.9 6.6 9.9 5.6 11.3 5.4L17.1 10.4C19.1 11.6 20.7 12.6 20.7 15.6Z" />
        <path d="M13.04 6.9L11.34 8.87M15.01 8.6L13.31 10.57" />
        <motion.path
          d="M17.1 12.8C13.3 13.8 9.5 13.2 6.7 10.2"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: [0, 0, 1, 1], opacity: [0, 0, 1, 1, 1] } : { pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9 / speed, ease: "easeOut", pathLength: { times: [0, 0.05, 0.45, 1] }, opacity: { times: [0, 0.05, 0.07, 0.45, 1], ease: "linear" } }}
        />
      </motion.g>
    </svg>
  );
}
