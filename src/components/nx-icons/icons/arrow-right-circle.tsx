"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ArrowRightCircleIconProps = {
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

/** A ring that beats twice like a pulse while the arrow rocks back, darts out to the right and returns from the left. */
export function ArrowRightCircleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ArrowRightCircleIconProps) {
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
        animate={on ? { scale: [1, 1.12, 1, 1.07, 1], opacity: [0, 0.9, 0, 0.6, 0] } : { opacity: 0 }}
        transition={{ duration: 0.6 / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
      />
      <circle cx="12" cy="12" r="9" />
      <motion.g
        initial={false}
        animate={on ? { x: [0, -1.5, 6, -6, 0], opacity: [1, 1, 0, 0, 1] } : { x: 0, y: 0, opacity: 1 }}
        transition={{
          x: { duration: 0.9 / speed, delay: (0.12) / speed, times: [0, 0.18, 0.4, 0.41, 0.85], ease: ["easeOut", "easeIn", "linear", "easeOut"] },
          opacity: { duration: 0.9 / speed, delay: (0.12) / speed, times: [0, 0.2, 0.32, 0.64, 0.84], ease: "linear" },
        }}
      >
        <path d="M7 12L17 12" />
        <path d="M12.5 7.5L17 12L12.5 16.5" />
      </motion.g>
    </svg>
  );
}
