"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SwordIconProps = {
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

/** A sword that winds up and swings a short slash arc while a glint runs up the blade. */
export function SwordIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SwordIconProps) {
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
        d="M5.4 5.37 A13.2 13.2 0 0 1 19.38 5.86"
        stroke={accent}
        strokeWidth={1.6}
        initial={false}
        animate={on ? { pathLength: [0, 0, 1, 1, 1], opacity: [0, 1, 1, 0, 0] } : { pathLength: 1, opacity: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.3, 0.55, 0.85, 1], ease: "easeOut" }}
      />
      <motion.g
        style={{ originX: "50%", originY: "70%" }}
        initial={false}
        animate={on ? { rotate: [0, -30, -30, 34, -6, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.28, 0.36, 0.55, 0.78, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M9.7 16V5.6L12 2.5l2.3 3.1V16" />
        <path d="M7 16h10" />
        <path d="M12 16v3.3" />
        <circle cx="12" cy="20.4" r="1.1" />
        <path d="M12 7.6v5.4" stroke={accent} strokeWidth={1} />
        <motion.path
          d="M12 12.6V11.4"
          strokeWidth={1.4}
          initial={false}
          animate={on ? { y: [0, 0, -3.6, -3.6], opacity: [0, 1, 1, 0] } : { y: 0, opacity: 0 }}
          transition={{ duration: 1 / speed, delay: (0.5) / speed, times: [0, 0.05, 0.9, 1], ease: "easeIn" }}
        />
      </motion.g>
    </svg>
  );
}
