"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ArrowUpCircleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30b0c7. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A ring that sends out a ripple, then the arrow inside floats up out of sight and rises again from the bottom. */
export function ArrowUpCircleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ArrowUpCircleIconProps) {
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
        cx="12"
        cy="12"
        r="9"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.22], opacity: [0.85, 0] } : { opacity: 0 }}
        transition={{ duration: 0.5 / speed, ease: "easeOut" }}
      />
      <circle cx="12" cy="12" r="9" />
      <motion.g
        initial={false}
        animate={on ? { y: [0, -6, 6, 0], opacity: [1, 0, 0, 1] } : { x: 0, y: 0, opacity: 1 }}
        transition={{
          y: { duration: 0.9 / speed, delay: (0.1) / speed, times: [0, 0.4, 0.41, 0.85], ease: ["easeIn", "linear", "easeOut"] },
          opacity: { duration: 0.9 / speed, delay: (0.1) / speed, times: [0, 0.26, 0.67, 0.86], ease: "linear" },
        }}
      >
        <path d="M12 17L12 7" />
        <path d="M7.5 11.5L12 7L16.5 11.5" />
      </motion.g>
    </svg>
  );
}
