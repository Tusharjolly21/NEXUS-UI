"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CellTowerIconProps = {
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

/** A lattice tower whose beacon blinks while the signal arcs pulse outward, inner pair first, then the outer pair. */
export function CellTowerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CellTowerIconProps) {
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
      <path d="M12 9.4 5.4 21.5M12 9.4 18.6 21.5M9.55 13.9 14.45 13.9M7.47 17.7 16.53 17.7M5.4 21.5 18.6 21.5" />
      <motion.circle
        cx="12"
        cy="7.5"
        r="1.6"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.5, 1, 1.5, 1] } : { scale: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.2, 0.4, 0.62, 0.85] }}
      />
      <motion.g
        style={{ originX: "50%", originY: "31.25%" }}
        initial={false}
        animate={on ? { scale: [1, 0.5, 1.12, 1, 0.5, 1.12, 1, 1], opacity: [1, 0, 1, 1, 0, 1, 1, 1] } : { scale: 1, opacity: 1 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.03, 0.28, 0.4, 0.43, 0.68, 0.8, 1], ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M9.12 4.72A4 4 0 0 0 9.12 10.28M14.88 4.72A4 4 0 0 1 14.88 10.28" stroke={accent} />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "31.25%" }}
        initial={false}
        animate={on ? { scale: [1, 0.5, 1.12, 1, 0.5, 1.12, 1, 1], opacity: [1, 0, 1, 1, 0, 1, 1, 1] } : { scale: 1, opacity: 1 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.03, 0.28, 0.4, 0.43, 0.68, 0.8, 1], ease: "easeOut", delay: (0.17) / speed }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M6.82 2.5A7.2 7.2 0 0 0 6.82 12.5M17.18 2.5A7.2 7.2 0 0 1 17.18 12.5" stroke={accent} />
      </motion.g>
    </svg>
  );
}
