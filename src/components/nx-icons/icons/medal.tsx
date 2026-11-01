"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MedalIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffd60a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A medal that swings like a pendulum on its ribbon while the star inside it glints. */
export function MedalIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MedalIconProps) {
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
        style={{ originX: "50%", originY: "0%" }}
        initial={false}
        animate={on ? { rotate: [0, -14, 10, -6, 2, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M8.2 2.8 10.8 10M15.8 2.8 13.2 10" stroke={accent} />
        <circle cx="12" cy="15.2" r="5.6" />
        <motion.path
          d="M12 12.4l.9 1.9 2.1.3-1.5 1.5.4 2.1-1.9-1-1.9 1 .4-2.1L9 14.6l2.1-.3z"
          fill={accent}
          stroke="none"
          style={{ originX: "50%", originY: "65%" }}
          initial={false}
          animate={on ? { scale: [1, 1, 1.5, 1] } : { scale: 1 }}
          transition={{ duration: 1 / speed, times: [0, 0.5, 0.65, 0.85] }}
        />
      </motion.g>
    </svg>
  );
}
