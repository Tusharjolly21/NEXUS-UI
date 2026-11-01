"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ScissorsIconProps = {
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

/** A pair of scissors that opens wide and snips twice. */
export function ScissorsIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ScissorsIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
        animate={on ? { rotate: [0, -14, 0, -14, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M8 8 20 20" />
        <circle cx="5.8" cy="5.8" r="2.6" stroke={accent} />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 14, 0, 14, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M8 16 20 4" />
        <circle cx="5.8" cy="18.2" r="2.6" stroke={accent} />
      </motion.g>
    </svg>
  );
}
