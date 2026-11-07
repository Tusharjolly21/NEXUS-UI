"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BanknoteIconProps = {
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

/** A banknote that flutters like paper in a draught while its centre circle pulses with green. */
export function BanknoteIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BanknoteIconProps) {
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
        animate={on ? { rotate: [0, -4, 3.2, -2, 0], y: [0, -1, 0.5, -0.3, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <rect x="2.5" y="6" width="19" height="12" rx="2.2" />
        <motion.circle
          cx="12"
          cy="12"
          r="2.6"
          stroke={accent}
          fill={accent}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1.28, 0.92, 1.12, 1], fillOpacity: [0, 0.4, 0, 0.25, 0] } : { scale: 1, fillOpacity: 0 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
        />
        <path d="M6.2 9.6h.01M17.8 14.4h.01" stroke={accent} />
      </motion.g>
    </svg>
  );
}
