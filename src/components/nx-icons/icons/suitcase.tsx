"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SuitcaseIconProps = {
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

/** A rolling suitcase whose handle pulls out, then the case tilts and rolls one step before settling. */
export function SuitcaseIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SuitcaseIconProps) {
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
        style={{ originX: "50%", originY: "92%" }}
        initial={false}
        animate={on ? { rotate: [0, 0, 9, 9, 0], x: [0, 0, 0, 2, 0] } : { rotate: 0, x: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.3, 0.5, 0.75, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <rect x="6" y="8" width="12" height="11.5" rx="2.5" />
        <path d="M10 11.5V16M14 11.5V16" stroke={accent} />
        <motion.path
          d="M9.5 8V3.2H14.5V8"
          style={{ originX: "50%", originY: "100%" }}
          initial={false}
          animate={on ? { scaleY: [1, 0.3, 0.3, 1] } : { scaleY: 1 }}
          transition={{ duration: 0.7 / speed, times: [0, 0.25, 0.4, 1], ease: "easeOut" }}
        />
        <circle cx="9" cy="20.8" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="15" cy="20.8" r="1.2" fill="currentColor" stroke="none" />
      </motion.g>
    </svg>
  );
}
