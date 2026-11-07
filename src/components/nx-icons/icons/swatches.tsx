"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SwatchesIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Three colour cards pinned at one corner fan out wider, one after another, and fold back into their stack. */
export function SwatchesIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SwatchesIconProps) {
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
        style={{ originX: "18.21%", originY: "81.75%" }}
        initial={false}
        animate={on ? { rotate: [0, -12, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.85 / speed, delay: (0) / speed, times: [0, 0.4, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M4.37 19.62L4.37 3.62A16 16 0 0 1 11.88 5.49z" fill={accent} fillOpacity={0.25} />
      </motion.g>
      <motion.g
        style={{ originX: "18.21%", originY: "81.75%" }}
        initial={false}
        animate={on ? { y: [0, -0.01, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.85 / speed, delay: (0.04) / speed, times: [0, 0.4, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M4.37 19.62L11.88 5.49A16 16 0 0 1 17.63 10.67z" fill={accent} fillOpacity={0.55} />
      </motion.g>
      <motion.g
        style={{ originX: "18.21%", originY: "81.75%" }}
        initial={false}
        animate={on ? { rotate: [0, 12, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.85 / speed, delay: (0.08) / speed, times: [0, 0.4, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M4.37 19.62L17.63 10.67A16 16 0 0 1 20.28 17.95z" fill={accent} fillOpacity={0.9} />
      </motion.g>
      <circle cx="4.37" cy="19.62" r="1.7" fill={accent} stroke="none" />
    </svg>
  );
}
