"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SignpostIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A signpost whose two boards swing a little in the wind, in opposite directions, and settle. */
export function SignpostIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SignpostIconProps) {
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
      <path d="M12 2.5V4M12 8.4V11.8M12 16.2V21.5" />
      <motion.g
        style={{ originX: "50%", originY: "26%" }}
        initial={false}
        animate={on ? { rotate: [0, 7, -5, 3, -1, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M6.5 4H17.5L20.5 6.2 17.5 8.4H6.5Z" />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "58%" }}
        initial={false}
        animate={on ? { rotate: [0, -7, 5, -3, 1, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, delay: (0.05) / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M17.5 11.8H6.5L3.5 14 6.5 16.2H17.5Z" stroke={accent} />
      </motion.g>
    </svg>
  );
}
