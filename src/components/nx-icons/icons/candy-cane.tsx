"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CandyCaneIconProps = {
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

/** A striped candy cane hangs by its hook and swings like a tree ornament until it comes to rest. */
export function CandyCaneIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CandyCaneIconProps) {
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
      <g transform="translate(1.71 0)">

      <motion.g
        style={{ originX: "42.92%", originY: "18.33%" }}
        initial={false}
        animate={on ? { rotate: [0, 11, -8, 5, -2.5, 0] } : { rotate: 0 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.2, 0.42, 0.62, 0.82, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g fill={accent} stroke="none">
          <path d="M12.1 16.25L12.73 15.9L13.37 15.55L14 15.2L14.63 14.85L15.27 14.5L15.9 14.16L15.9 13.94L15.9 13.72L15.9 13.5L15.9 13.28L15.9 13.06L15.9 12.84L15.9 12.62L15.9 12.41L15.27 12.75L14.63 13.1L14 13.45L13.37 13.8L12.73 14.15L12.1 14.5L12.1 14.71L12.1 14.93L12.1 15.15L12.1 15.37L12.1 15.59L12.1 15.81L12.1 16.03Z" />
          <path d="M12.1 12.75L12.73 12.4L13.37 12.05L14 11.7L14.63 11.35L15.27 11L15.9 10.66L15.9 10.44L15.9 10.22L15.9 10L15.9 9.78L15.9 9.56L15.9 9.34L15.9 9.12L15.9 8.91L15.27 9.25L14.63 9.6L14 9.95L13.37 10.3L12.73 10.65L12.1 11L12.1 11.21L12.1 11.43L12.1 11.65L12.1 11.87L12.1 12.09L12.1 12.31L12.1 12.53Z" />
          <path d="M12.1 9.25L12.73 8.9L13.37 8.55L14 8.2L14.62 7.81L15.2 7.3L15.72 6.69L15.63 6.37L15.51 6.06L15.38 5.75L15.24 5.46L15.07 5.17L14.89 4.89L14.69 4.63L14.48 4.37L14.3 5.16L14.02 5.87L13.64 6.5L13.18 7.04L12.65 7.48L12.08 7.81L12.09 7.91L12.1 8.02L12.1 8.15L12.1 8.37L12.1 8.59L12.1 8.81L12.1 9.03Z" />
          <path d="M11.75 7.03L12.11 6.48L12.38 5.85L12.54 5.16L12.59 4.42L12.52 3.66L12.32 2.88L12.01 2.77L11.69 2.68L11.37 2.6L11.04 2.55L10.71 2.52L10.38 2.5L10.05 2.51L9.72 2.53L10.25 3.13L10.67 3.78L10.96 4.46L11.13 5.15L11.17 5.83L11.1 6.49L11.2 6.54L11.29 6.59L11.37 6.65L11.46 6.72L11.54 6.79L11.61 6.87L11.68 6.95Z" />
          <path d="M10.28 6.3L10.04 5.68L9.69 5.09L9.23 4.56L8.66 4.09L8 3.7L7.25 3.41L6.98 3.59L6.71 3.8L6.47 4.02L6.23 4.25L6.01 4.5L5.81 4.76L5.62 5.03L5.44 5.31L6.24 5.23L7.01 5.28L7.73 5.44L8.39 5.7L8.97 6.06L9.46 6.51L9.56 6.46L9.66 6.42L9.76 6.38L9.86 6.36L9.96 6.33L10.07 6.32L10.17 6.3Z" />
          <path d="M8.83 7.06L8.19 6.89L7.51 6.84L6.8 6.9L6.09 7.08L5.38 7.39L4.71 7.83L4.7 8.14L4.7 8.36L4.7 8.58L4.7 8.8L4.7 9.01L4.7 9.23L4.7 9.45L4.7 9.67L5.33 9.32L5.97 8.97L6.6 8.63L7.23 8.28L7.87 7.99L8.52 7.85L8.54 7.74L8.56 7.64L8.59 7.54L8.63 7.44L8.67 7.34L8.72 7.24L8.77 7.15Z" />
        </g>
        <path d="M15.9 19.6V8.1A5.6 5.6 0 0 0 4.7 8.1V10.6A1.9 1.9 0 0 0 8.5 10.6V8.1A1.8 1.8 0 0 1 12.1 8.1V19.6A1.9 1.9 0 0 0 15.9 19.6Z" />
      </motion.g>

      </g>
    </svg>
  );
}
