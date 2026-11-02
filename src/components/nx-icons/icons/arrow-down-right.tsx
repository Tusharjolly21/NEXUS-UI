"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ArrowDownRightIconProps = {
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

/** An arrow that rocks back, fires off to the lower right, and lands again from the upper left with a ripple at its tip. */
export function ArrowDownRightIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ArrowDownRightIconProps) {
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
      <motion.circle
        cx="18.5"
        cy="18.5"
        r="2.2"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [0.4, 1.6], opacity: [0, 0.9, 0] } : { opacity: 0 }}
        transition={{ duration: 0.38 / speed, delay: (0.54) / speed, ease: "easeOut" }}
      />
      <motion.g
        initial={false}
        animate={on ? { x: [0, -1.4, 9, -9, 0], y: [0, -1.4, 9, -9, 0], opacity: [1, 1, 0, 0, 1] } : { x: 0, y: 0, opacity: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.16, 0.38, 0.39, 0.82], ease: ["easeOut", "easeIn", "linear", "easeOut"] }}
      >
        <path d="M5.5 5.5L18.5 18.5" />
        <path d="M18.5 11.5L18.5 18.5L11.5 18.5" />
      </motion.g>
    </svg>
  );
}
