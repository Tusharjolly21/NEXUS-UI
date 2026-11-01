"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SunIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff9f0a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A sun that warms up, fills with gold and turns its rays a notch. */
export function SunIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SunIconProps) {
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
        animate={on ? { rotate: [0, 45], scale: [1, 1.1, 1] } : { rotate: 0, scale: 1 }}
        transition={{ rotate: { duration: 1.2 / speed, ease: "easeInOut" }, scale: { duration: 1.2 / speed, ease: "easeInOut" } }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1="12" y1="2.6" x2="12" y2="4.8" stroke={accent} transform={`rotate(${i * 45} 12 12)`} />
        ))}
        <motion.circle
          cx="12"
          cy="12"
          r="3.9"
          fill={accent}
          initial={false}
          animate={{ fillOpacity: on ? [0, 0.9] : 0 }}
          transition={{ duration: 1 / speed, ease: "easeOut" }}
        />
      </motion.g>
    </svg>
  );
}
