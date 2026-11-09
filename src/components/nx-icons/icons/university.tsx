"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type UniversityIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A university whose mortarboard tassel swings while the columns light up in a wave. */
export function UniversityIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: UniversityIconProps) {
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
      <path d="M2.5 12.7 12 9.2l9.5 3.5Z" />
      <path d="M6 12.7V18" />
      <path d="M10 12.7V18" />
      <path d="M14 12.7V18" />
      <path d="M18 12.7V18" />
      <motion.path
        d="M6 13.7V17"
        stroke={accent}
        strokeLinecap="butt"
        initial={false}
        animate={on ? { opacity: [0, 1, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.4 / speed, times: [0, 0.3, 0.7, 1], delay: (0.1) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M10 13.7V17"
        stroke={accent}
        strokeLinecap="butt"
        initial={false}
        animate={on ? { opacity: [0, 1, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.4 / speed, times: [0, 0.3, 0.7, 1], delay: (0.24) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M14 13.7V17"
        stroke={accent}
        strokeLinecap="butt"
        initial={false}
        animate={on ? { opacity: [0, 1, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.4 / speed, times: [0, 0.3, 0.7, 1], delay: (0.38) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M18 13.7V17"
        stroke={accent}
        strokeLinecap="butt"
        initial={false}
        animate={on ? { opacity: [0, 1, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.4 / speed, times: [0, 0.3, 0.7, 1], delay: (0.52) / speed, ease: "easeInOut" }}
      />
      <path d="M4.5 18H19.5M2.5 21H21.5" />
      <path d="M7 4.5 12 3l5 1.5L12 6Z" fill="currentColor" />
      <motion.g
        style={{ originX: "70.83%", originY: "18.75%" }}
        initial={false}
        animate={on ? { rotate: [0, 28, -20, 12, -5, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M17 4.5V7.4" stroke={accent} strokeWidth={strokeWidth * 0.75} />
        <circle cx="17" cy="7.9" r="0.9" fill={accent} stroke="none" />
      </motion.g>
    </svg>
  );
}
