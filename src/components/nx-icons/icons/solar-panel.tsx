"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SolarPanelIconProps = {
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

/** The sun's rays pulse outwards while the panel's cells light up one after another in a sweep. */
export function SolarPanelIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SolarPanelIconProps) {
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
        style={{ originX: "28.33%", originY: "28.33%" }}
        initial={false}
        animate={on ? { scale: [1, 1.18, 1, 1.12, 1] } : { scale: 1 }}
        transition={{ duration: 0.8 / speed }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3.7 6.8L2.5 6.8M4.61 4.61L3.76 3.76M6.8 3.7L6.8 2.5M8.99 4.61L9.84 3.76M9.9 6.8L11.1 6.8" stroke={accent} strokeWidth={strokeWidth * 0.75} />
      </motion.g>
      <circle cx="6.8" cy="6.8" r="1.9" fill={accent} stroke="none" />
      {([
          ["M12.42 9.95L13.55 9.95L13.25 10.88L12.12 10.88z", 0],
          ["M15.25 9.95L16.89 9.95L16.59 10.88L14.95 10.88z", 1],
          ["M18.59 9.95L19.72 9.95L19.42 10.88L18.29 10.88z", 2],
          ["M11.58 12.58L12.71 12.58L12.25 14.02L11.12 14.02z", 1],
          ["M14.41 12.58L16.05 12.58L15.59 14.02L13.95 14.02z", 2],
          ["M17.75 12.58L18.88 12.58L18.42 14.02L17.29 14.02z", 3],
          ["M10.58 15.72L11.71 15.72L11.41 16.65L10.28 16.65z", 2],
          ["M13.41 15.72L15.05 15.72L14.75 16.65L13.11 16.65z", 3],
          ["M16.75 15.72L17.88 15.72L17.58 16.65L16.45 16.65z", 4],
        ] as [string, number][]).map(([d, k]) => (
        <motion.path
          key={d}
          d={d}
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { opacity: [0, 0.85, 0] } : { opacity: 0 }}
          transition={{ duration: 0.45 / speed, delay: (on ? 0.1 + k * 0.1 : 0) / speed }}
        />
      ))}
      <path d="M14.83 8.6L11.83 18M18.17 8.6L15.17 18M10.5 11.73L20.5 11.73M9.5 14.87L19.5 14.87" strokeWidth={strokeWidth * 0.5} />
      <path d="M11.5 8.6L21.5 8.6L18.5 18L8.5 18z" />
      <path d="M13.5 18V21.5M10.5 21.5H16.5" />
    </svg>
  );
}
