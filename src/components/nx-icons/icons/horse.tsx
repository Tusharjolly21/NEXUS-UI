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
        <path d="M16.6 9 L13.5 5.9 Q13.2 4 12.1 2.5 Q10.4 4.1 10 6.2 C8 7.6 5.6 10.4 4.8 14.2 C2.5 15.4 2.2 18.7 4.8 19.7 C8 20.8 11.4 19.6 11.9 16.6 C11.7 18.6 12.3 20.2 12.6 21.5 L19 21.5" />
        <path d="M16.6 9 C18.6 12 17.4 17 19 21.5" />
        <motion.path
          d="M16.93 9.56 Q19.49 9.66 20.13 10.96"
          stroke={accent}
          strokeWidth={strokeWidth * 0.8}
          initial={false}
          animate={on ? { d: ["M16.93 9.56 Q19.49 9.66 20.13 10.96", "M16.93 9.56 Q19.94 9.91 21.03 11.46", "M16.93 9.56 Q19.19 9.51 19.53 10.66", "M16.93 9.56 Q19.84 9.86 20.83 11.36", "M16.93 9.56 Q19.49 9.66 20.13 10.96"] } : { d: "M16.93 9.56 Q19.49 9.66 20.13 10.96" }}
          transition={{ duration: 0.72 / speed, delay: (0) / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
        />
        <motion.path
          d="M17.72 12.29 Q20.52 12.39 21.22 14.79"
          stroke={accent}
          strokeWidth={strokeWidth * 0.8}
          initial={false}
          animate={on ? { d: ["M17.72 12.29 Q20.52 12.39 21.22 14.79", "M17.72 12.29 Q20.92 12.64 22.03 15.29", "M17.72 12.29 Q20.25 12.24 20.68 14.49", "M17.72 12.29 Q20.83 12.59 21.85 15.19", "M17.72 12.29 Q20.52 12.39 21.22 14.79"] } : { d: "M17.72 12.29 Q20.52 12.39 21.22 14.79" }}
          transition={{ duration: 0.72 / speed, delay: (0.06) / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
        />
        <motion.path
          d="M18 15.48 Q20.64 15.58 21.3 18.18"
          stroke={accent}
          strokeWidth={strokeWidth * 0.8}
          initial={false}
          animate={on ? { d: ["M18 15.48 Q20.64 15.58 21.3 18.18", "M18 15.48 Q21 15.83 22.02 18.68", "M18 15.48 Q20.4 15.43 20.82 17.88", "M18 15.48 Q20.92 15.78 21.86 18.58", "M18 15.48 Q20.64 15.58 21.3 18.18"] } : { d: "M18 15.48 Q20.64 15.58 21.3 18.18" }}
          transition={{ duration: 0.72 / speed, delay: (0.12) / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
        />
        <motion.path
          d="M18.35 18.9 Q20.59 19 21.15 20.8"
          stroke={accent}
          strokeWidth={strokeWidth * 0.8}
          initial={false}
          animate={on ? { d: ["M18.35 18.9 Q20.59 19 21.15 20.8", "M18.35 18.9 Q20.91 19.25 21.78 21.3", "M18.35 18.9 Q20.38 18.85 20.73 20.5", "M18.35 18.9 Q20.84 19.2 21.64 21.2", "M18.35 18.9 Q20.59 19 21.15 20.8"] } : { d: "M18.35 18.9 Q20.59 19 21.15 20.8" }}
          transition={{ duration: 0.72 / speed, delay: (0.18) / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
        />
        <path d="M9.2 10.6h0.01" strokeWidth={strokeWidth * 0.85} />
        <path d="M5.2 16.3h0.01" strokeWidth={strokeWidth * 0.75} />
      </motion.g>
    </svg>
  );
}
