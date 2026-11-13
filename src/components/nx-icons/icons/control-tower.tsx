"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ControlTowerIconProps = {
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

/** An airport control tower whose beacon sends out signal arcs while the glass band blinks. */
export function ControlTowerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ControlTowerIconProps) {
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
        d="M6.48 9.8H17.52"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [1, 0.35, 1, 0.35, 1] } : { opacity: 1 }}
        transition={{ duration: 0.9 / speed, ease: "linear" }}
      />
      <path d="M5.5 6.6H18.5L16.5 13.1H7.5Z" />
      <path d="M10.2 13.1L8.8 21.5M13.8 13.1L15.2 21.5M6.8 21.5H17.2" />
      <path d="M12 6.6V4.35" strokeLinecap="butt" />
      <circle cx="12" cy="3.1" r="1.6" fill={accent} stroke="none" />
      <motion.path
        d="M9.05 3.62 A3 3 0 0 1 9.22 1.98"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { opacity: [0, 1, 0], pathLength: [0.3, 1, 1] } : { opacity: 0 }}
        transition={{ duration: 0.45 / speed, delay: (on ? 0.05 : 0) / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M14.78 1.98 A3 3 0 0 1 14.95 3.62"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { opacity: [0, 1, 0], pathLength: [0.3, 1, 1] } : { opacity: 0 }}
        transition={{ duration: 0.45 / speed, delay: (on ? 0.05 : 0) / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M6.88 4 A5.2 5.2 0 0 1 7.18 1.15"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { opacity: [0, 1, 0], pathLength: [0.3, 1, 1] } : { opacity: 0 }}
        transition={{ duration: 0.45 / speed, delay: (on ? 0.3 : 0) / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M16.82 1.15 A5.2 5.2 0 0 1 17.12 4"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { opacity: [0, 1, 0], pathLength: [0.3, 1, 1] } : { opacity: 0 }}
        transition={{ duration: 0.45 / speed, delay: (on ? 0.3 : 0) / speed, ease: "easeOut" }}
      />
    </svg>
  );
}
