"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MagnetIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff3b30. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A magnet that hums and shakes as iron filings are pulled towards its poles. */
export function MagnetIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MagnetIconProps) {
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
        animate={on ? { x: [0, -0.6, 0.6, -0.6, 0.4, 0] } : { x: 0 }}
        transition={{ duration: 0.5 / speed }}
      >
        <path d="M5 4v8a7 7 0 0 0 14 0V4h-4v8a3 3 0 0 1-6 0V4z" />
        <path d="M5 8h4M15 8h4" stroke={accent} />
      </motion.g>
      {[7, 17].map((x, i) => (
        <motion.circle
          key={x}
          cx={x}
          cy="1.6"
          r="0.8"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { scale: [0, 1.6, 1], y: [-1, 0.6, 0] } : { scale: 0 }}
          style={{ originX: "50%", originY: "50%" }}
          transition={{ duration: 0.35 / speed, delay: (0.1 + i * 0.1) / speed }}
        />
      ))}
    </svg>
  );
}
