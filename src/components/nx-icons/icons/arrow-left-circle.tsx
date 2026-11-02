"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ArrowLeftCircleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #a2845e. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A coloured line that circles the ring while the arrow slips out to the left and returns from the right, its shaft drawing in. */
export function ArrowLeftCircleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ArrowLeftCircleIconProps) {
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
        d="M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [1, 1, 0] } : { pathLength: 1, opacity: 0 }}
        transition={{ duration: 0.55 / speed, ease: "easeInOut", opacity: { duration: 0.55 / speed, times: [0, 0.75, 1] } }}
      />
      <circle cx="12" cy="12" r="9" />
      <motion.g
        initial={false}
        animate={on ? { x: [0, -6, 6, 0], opacity: [1, 0, 0, 1] } : { x: 0, y: 0, opacity: 1 }}
        transition={{
          x: { duration: 0.9 / speed, delay: (0.1) / speed, times: [0, 0.4, 0.41, 0.85], ease: ["easeIn", "linear", "easeOut"] },
          opacity: { duration: 0.9 / speed, delay: (0.1) / speed, times: [0, 0.26, 0.67, 0.86], ease: "linear" },
        }}
      >
        <motion.path
          d="M17 12L7 12"
          initial={false}
          animate={on ? { pathLength: [1, 1, 0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.9 / speed, delay: (0.1) / speed, times: [0, 0.41, 0.5, 0.9], ease: "easeOut" }}
        />
        <path d="M11.5 16.5L7 12L11.5 7.5" />
      </motion.g>
    </svg>
  );
}
