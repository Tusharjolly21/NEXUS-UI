"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HorseIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ac8e68. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A horse that nods its head twice while the strands of its mane ripple down its neck. */
export function HorseIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HorseIconProps) {
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
        style={{ originX: "70.83%", originY: "89.17%" }}
        initial={false}
        animate={on ? { rotate: [0, -7, 0, -5, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M17.09 9.9 Q19.59 10 20.09 10.9"
          stroke={accent}
          strokeWidth={strokeWidth * 0.8}
          initial={false}
          animate={on ? { d: ["M17.09 9.9 Q19.59 10 20.09 10.9", "M17.09 9.9 Q19.99 10.2 20.89 11.3", "M17.09 9.9 Q19.29 9.85 19.49 10.6", "M17.09 9.9 Q19.89 10.15 20.69 11.2", "M17.09 9.9 Q19.59 10 20.09 10.9"] } : { d: "M17.09 9.9 Q19.59 10 20.09 10.9" }}
          transition={{ duration: 0.72 / speed, delay: (0) / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
        />
        <motion.path
          d="M17.83 13.2 Q20.33 13.3 20.83 14.2"
          stroke={accent}
          strokeWidth={strokeWidth * 0.8}
          initial={false}
          animate={on ? { d: ["M17.83 13.2 Q20.33 13.3 20.83 14.2", "M17.83 13.2 Q20.73 13.5 21.63 14.6", "M17.83 13.2 Q20.03 13.15 20.23 13.9", "M17.83 13.2 Q20.63 13.45 21.43 14.5", "M17.83 13.2 Q20.33 13.3 20.83 14.2"] } : { d: "M17.83 13.2 Q20.33 13.3 20.83 14.2" }}
          transition={{ duration: 0.72 / speed, delay: (0.06) / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
        />
        <motion.path
          d="M18.08 16.5 Q20.58 16.6 21.08 17.5"
          stroke={accent}
          strokeWidth={strokeWidth * 0.8}
          initial={false}
          animate={on ? { d: ["M18.08 16.5 Q20.58 16.6 21.08 17.5", "M18.08 16.5 Q20.98 16.8 21.88 17.9", "M18.08 16.5 Q20.28 16.45 20.48 17.2", "M18.08 16.5 Q20.88 16.75 21.68 17.8", "M18.08 16.5 Q20.58 16.6 21.08 17.5"] } : { d: "M18.08 16.5 Q20.58 16.6 21.08 17.5" }}
          transition={{ duration: 0.72 / speed, delay: (0.12) / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
        />
        <motion.path
          d="M18.52 19.8 Q21.02 19.9 21.52 20.8"
          stroke={accent}
          strokeWidth={strokeWidth * 0.8}
          initial={false}
          animate={on ? { d: ["M18.52 19.8 Q21.02 19.9 21.52 20.8", "M18.52 19.8 Q21.42 20.1 22.32 21.2", "M18.52 19.8 Q20.72 19.75 20.92 20.5", "M18.52 19.8 Q21.32 20.05 22.12 21.1", "M18.52 19.8 Q21.02 19.9 21.52 20.8"] } : { d: "M18.52 19.8 Q21.02 19.9 21.52 20.8" }}
          transition={{ duration: 0.72 / speed, delay: (0.18) / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
        />
        <path d="M16.6 9 L13.5 5.9 Q13.2 4 12.1 2.5 Q10.4 4.1 10 6.2 C8 7.6 5.6 10.4 4.8 14.2 C2.5 15.4 2.2 18.7 4.8 19.7 C8 20.8 11.4 19.6 11.9 16.6 C11.7 18.6 12.3 20.2 12.6 21.5 L19 21.5 C17.4 17 18.6 12 16.6 9Z" />
        <path d="M9.2 10.6h0.01" strokeWidth={strokeWidth * 0.85} />
        <path d="M5.2 16.3h0.01" strokeWidth={strokeWidth * 0.75} />
      </motion.g>
    </svg>
  );
}
