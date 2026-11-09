"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SatelliteDishIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A satellite dish that swings to find a signal and locks on as two signal arcs pulse. */
export function SatelliteDishIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SatelliteDishIconProps) {
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
      <g transform="translate(2 1.79)">
      <path d="M8.2 16.6v3M5.2 19.6h6" />
      <motion.g
        style={{ originX: "34.17%", originY: "69.17%" }}
        initial={false}
        animate={on ? { rotate: [0, -26, 12, -4, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.3, 0.55, 0.75, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3.82 6.02A6.2 6.2 0 0 0 12.58 14.78z" />
        <path d="M8.2 10.4L11.45 7.15" />
        <path d="M11.45 7.15h.01" strokeWidth={3} />
      </motion.g>
      <motion.path
        d="M11.84 3.97A3.2 3.2 0 0 1 14.63 6.76"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [1, 0.15, 0.15, 1, 0.35, 1] } : { opacity: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.15, 0.55, 0.66, 0.8, 1] }}
      />
      <motion.path
        d="M12.23 0.8A6.4 6.4 0 0 1 17.8 6.37"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [1, 0.15, 0.15, 1, 0.35, 1] } : { opacity: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.15, 0.62, 0.74, 0.88, 1] }}
      />
      </g>
    </svg>
  );
}
