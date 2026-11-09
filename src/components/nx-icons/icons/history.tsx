"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HistoryIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A loop arrow winds back a touch, then spins counter clockwise around a clock whose hands whirl backwards into place. */
export function HistoryIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HistoryIconProps) {
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
        animate={on ? { rotate: [0, 16, -360] } : { rotate: 0 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.16, 1], ease: ["easeOut", "easeInOut"] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M5.45 16.59A8 8 0 1 0 4.75 8.62" />
        <path d="M7.76 7.52 4.75 8.62 3.66 5.61" />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 24, -720] } : { rotate: 0 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.16, 1], ease: ["easeOut", "easeInOut"] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 12V8" stroke={accent} />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 8, -360] } : { rotate: 0 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.16, 1], ease: ["easeOut", "easeInOut"] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 12 14.77 13.6" stroke={accent} />
      </motion.g>
    </svg>
  );
}
