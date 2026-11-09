"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type DonutIconProps = {
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

/** A donut that rolls a quarter turn while its sprinkles hop in turn. */
export function DonutIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: DonutIconProps) {
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
        animate={on ? { rotate: 90, x: [0, 1.0, 0] } : { rotate: 0, x: 0, transition: { duration: 0 / speed } }}
        transition={{ duration: 0.7 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M15.29 4.05A4.45 4.45 0 0 1 19.95 8.71A4.45 4.45 0 0 1 19.95 15.29A4.45 4.45 0 0 1 15.29 19.95A4.45 4.45 0 0 1 8.71 19.95A4.45 4.45 0 0 1 4.05 15.29A4.45 4.45 0 0 1 4.05 8.71A4.45 4.45 0 0 1 8.71 4.05A4.45 4.45 0 0 1 15.29 4.05z" />
        <circle cx="12" cy="12" r="2.8" />
      </motion.g>
      <motion.path
        d="M16.93 8.29L17.21 9.86"
        stroke={accent}
        style={{ originX: "71.1%", originY: "37.8%" }}
        initial={false}
        animate={on ? { scale: [1, 1.4, 1] } : { scale: 1 }}
        transition={{ duration: 0.36 / speed, delay: (0.28) / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M12.75 18.12L11.25 17.58"
        stroke={accent}
        style={{ originX: "50%", originY: "74.4%" }}
        initial={false}
        animate={on ? { scale: [1, 1.4, 1] } : { scale: 1 }}
        transition={{ duration: 0.36 / speed, delay: (0.4) / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M6.32 9.59L7.55 8.56"
        stroke={accent}
        style={{ originX: "28.9%", originY: "37.8%" }}
        initial={false}
        animate={on ? { scale: [1, 1.4, 1] } : { scale: 1 }}
        transition={{ duration: 0.36 / speed, delay: (0.52) / speed, ease: "easeOut" }}
      />
    </svg>
  );
}
