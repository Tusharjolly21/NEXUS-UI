"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PhoneIconProps = {
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

/** A smartphone that buzzes and rings, its screen glowing green and sound waves pulsing at the sides. */
export function PhoneIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PhoneIconProps) {
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
        animate={on ? { x: [0, -0.8, 0.8, -0.8, 0.8, -0.5, 0.5, 0] } : { x: 0 }}
        transition={on ? { duration: 0.5 / speed, repeat: 1 } : { duration: 0.15 / speed }}
      >
        <rect x="7.2" y="2.6" width="9.6" height="18.8" rx="2.6" />
        <path d="M10.6 5.4h2.8M10.8 18.6h2.4" />
        <motion.rect
          x="9.2"
          y="8.4"
          width="5.6"
          height="4.6"
          rx="1.2"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { fillOpacity: [0, 0.6, 0, 0.6, 0] } : { fillOpacity: 0 }}
          transition={{ duration: 1 / speed }}
        />
      </motion.g>
      {["M4.6 9.4a3.2 3.2 0 0 0 0 3.2", "M2.6 8.2a5.4 5.4 0 0 0 0 5.6", "M19.4 9.4a3.2 3.2 0 0 1 0 3.2", "M21.4 8.2a5.4 5.4 0 0 1 0 5.6"].map((d, i) => (
        <motion.path
          key={d}
          d={d}
          stroke={accent}
          initial={false}
          animate={on ? { opacity: [0, 1, 0, 1, 0] } : { opacity: 0 }}
          transition={{ duration: 1 / speed, delay: ((i % 2) * 0.08) / speed }}
        />
      ))}
    </svg>
  );
}
