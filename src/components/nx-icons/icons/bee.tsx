"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BeeIconProps = {
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

/** A bee whose wings buzz while the whole bee hovers in a small figure of eight. */
export function BeeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BeeIconProps) {
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
        initial={false}
        animate={on ? { x: [0.0, 0.55, 0.953, 1.1, 0.953, 0.55, 0.0, -0.55, -0.953, -1.1, -0.953, -0.55, -0.0], y: [0.0, 0.606, 0.606, 0.0, -0.606, -0.606, -0.0, 0.606, 0.606, 0.0, -0.606, -0.606, -0.0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.9 / speed, ease: "linear" }}
      >
        
        <motion.g
          style={{ originX: "47.28%", originY: "40.55%" }}
          initial={false}
          animate={on ? { rotate: [0, -7, 6, -7, 6, -7, 6, -7, 6, -7, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 / speed, delay: (on ? 0 : 0) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M10.25 9.95A1.6 3.6 5 1 1 12.44 9.52" stroke={accent} fill={accent} fillOpacity={0.2} />
        </motion.g>
        <motion.g
          style={{ originX: "69.48%", originY: "43.43%" }}
          initial={false}
          animate={on ? { rotate: [0, -7, 6, -7, 6, -7, 6, -7, 6, -7, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 / speed, delay: (on ? 0.05 : 0) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M15.69 9.93A1.6 3.6 42 1 1 17.66 10.92" stroke={accent} fill={accent} fillOpacity={0.2} />
        </motion.g>
        <path d="M6.7 12.71A6.9 5.4 0 1 1 7.07 17.67A2.9 2.9 0 1 1 6.7 12.71" />
        <path d="M11.1 9.71L11.1 20.09M15.5 9.87L15.5 19.93" />
        <path d="M19.3 13.9L22 14.9L19.3 15.9Z" fill="currentColor" strokeWidth={1} />
        <path d="M4.5 12.54Q3.9 9.54 2.2 8.84M6.85 12.79Q7.05 9.59 5.05 8.39" strokeWidth={1.4} />
        <circle cx="4.9" cy="14.8" r="0.9" fill="currentColor" stroke="none" />
      </motion.g>
    </svg>
  );
}
