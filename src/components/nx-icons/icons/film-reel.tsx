"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FilmReelIconProps = {
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

/** The film reel spins up, runs at speed and winds down, hub dot steady in the centre. */
export function FilmReelIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FilmReelIconProps) {
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
      <circle cx="12" cy="12" r="8.6" />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 144, 216, 288] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.4, 0.7, 1], ease: ["easeIn", "linear", "easeOut"] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="12" cy="7.3" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="16.47" cy="10.55" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="14.76" cy="15.8" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="9.24" cy="15.8" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="7.53" cy="10.55" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1.6" fill={accent} stroke="none" />
      </motion.g>
    </svg>
  );
}
