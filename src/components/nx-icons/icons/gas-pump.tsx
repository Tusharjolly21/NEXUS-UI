"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GasPumpIconProps = {
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

/** A fuel pump whose display counts up as the hose twitches while it fills. */
export function GasPumpIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GasPumpIconProps) {
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
      <path d="M4.5 21V5.5A2.5 2.5 0 0 1 7 3H11A2.5 2.5 0 0 1 13.5 5.5V21M2.5 21H15" />
      <rect x="7" y="6" width="4" height="3.2" rx="0.6" stroke={accent} strokeWidth={strokeWidth * 0.7} />
      <motion.path
        d="M8.2 7.6H9.8"
        stroke={accent}
        strokeWidth={strokeWidth * 0.7}
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.8 / speed, ease: "linear" }}
      />
      <motion.g
        style={{ originX: "56%", originY: "40%" }}
        initial={false}
        animate={on ? { rotate: [0, 4, -3, 3, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M13.5 9.5H17A1.5 1.5 0 0 1 18.5 11V16.5A1.5 1.5 0 0 0 21.5 16.5V11L19.8 7.6" />
      </motion.g>
    </svg>
  );
}
