"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ParachuteIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff453a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A parachute that drifts and sways like a pendulum under its canopy. */
export function ParachuteIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ParachuteIconProps) {
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
        style={{ originX: "50%", originY: "10.42%" }}
        initial={false}
        animate={on ? { rotate: [0, 7, -6, 3, -1, 0] } : { rotate: 0 }}
        transition={{ duration: 1.1 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <rect x="8.5" y="17.5" width="7" height="4" rx="1" fill={accent} fillOpacity={0.45} />
        <path d="M3.5 11L8.5 17.5M9.17 11L10.83 17.5M14.83 11L13.17 17.5M20.5 11L15.5 17.5" strokeWidth={strokeWidth * 0.75} />
        <path d="M3.5 11A8.5 8.5 0 0 1 20.5 11A6 6 0 0 0 14.83 11A6 6 0 0 0 9.17 11A6 6 0 0 0 3.5 11Z" />
      </motion.g>
    </svg>
  );
}
