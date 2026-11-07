"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GuitarIconProps = {
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

/** An acoustic guitar whose three strings vibrate as if plucked, one after another. */
export function GuitarIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GuitarIconProps) {
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
      <g transform="translate(12.75 11.25) rotate(-45) translate(0 0)">
        <path d="M4.06 0.95A3.8 3.8 0 0 1 -1.33 3.39A1.23 1.23 0 0 0 -2.78 3.65A5.32 5.32 0 0 1 -11.97 0A5.32 5.32 0 0 1 -2.78 -3.65A1.23 1.23 0 0 0 -1.33 -3.39A3.8 3.8 0 0 1 4.06 -0.95z" />
        <circle cx="0.19" cy="0" r="1.42" strokeWidth={1.2} />
        <path d="M-8.17 -1.99V1.99" stroke={accent} />
        <path d="M4.06 0H9" />
        <rect x="9" y="-1.8" width="2.47" height="3.61" rx="0.8" fill="currentColor" strokeWidth={1} />
        <motion.path
          d="M-8.17 -0.95Q0.41 -0.67 9 -0.38"
          stroke={accent}
          strokeWidth={0.5}
          initial={false}
          animate={on ? { d: ["M-8.17 -0.95Q0.41 -0.67 9 -0.38", "M-8.17 -0.95Q0.41 0.83 9 -0.38", "M-8.17 -0.95Q0.41 -1.86 9 -0.38", "M-8.17 -0.95Q0.41 0.23 9 -0.38", "M-8.17 -0.95Q0.41 -1.17 9 -0.38", "M-8.17 -0.95Q0.41 -0.47 9 -0.38", "M-8.17 -0.95Q0.41 -0.67 9 -0.38"] } : { d: "M-8.17 -0.95Q0.41 -0.67 9 -0.38" }}
          transition={{ duration: 0.6 / speed, delay: (0) / speed, ease: "easeOut" }}
        />
        <motion.path
          d="M-8.17 0Q0.41 0 9 0"
          stroke={accent}
          strokeWidth={0.5}
          initial={false}
          animate={on ? { d: ["M-8.17 0Q0.41 0 9 0", "M-8.17 0Q0.41 -1.5 9 0", "M-8.17 0Q0.41 1.2 9 0", "M-8.17 0Q0.41 -0.9 9 0", "M-8.17 0Q0.41 0.5 9 0", "M-8.17 0Q0.41 -0.2 9 0", "M-8.17 0Q0.41 0 9 0"] } : { d: "M-8.17 0Q0.41 0 9 0" }}
          transition={{ duration: 0.6 / speed, delay: (0.16) / speed, ease: "easeOut" }}
        />
        <motion.path
          d="M-8.17 0.95Q0.41 0.67 9 0.38"
          stroke={accent}
          strokeWidth={0.5}
          initial={false}
          animate={on ? { d: ["M-8.17 0.95Q0.41 0.67 9 0.38", "M-8.17 0.95Q0.41 2.17 9 0.38", "M-8.17 0.95Q0.41 -0.53 9 0.38", "M-8.17 0.95Q0.41 1.56 9 0.38", "M-8.17 0.95Q0.41 0.17 9 0.38", "M-8.17 0.95Q0.41 0.86 9 0.38", "M-8.17 0.95Q0.41 0.67 9 0.38"] } : { d: "M-8.17 0.95Q0.41 0.67 9 0.38" }}
          transition={{ duration: 0.6 / speed, delay: (0.32) / speed, ease: "easeOut" }}
        />
      </g>
    </svg>
  );
}
