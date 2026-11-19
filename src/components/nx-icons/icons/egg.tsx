"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type EggIconProps = {
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

/** An egg rocks on its tip, wobbles again and a zigzag crack runs across its shell before it closes up. */
export function EggIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: EggIconProps) {
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
      <g transform="translate(0 -0.42)">

      <motion.g
        style={{ originX: "50%", originY: "90%" }}
        initial={false}
        animate={on ? { rotate: [0, -9, 8, -5, 3, 0, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.14, 0.3, 0.45, 0.58, 0.7, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M19.02 12.58L16.92 11.28L15.02 13.38L13.02 11.58L11.42 13.08"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: [0, 0, 1, 1, 1], opacity: [0, 0, 1, 1, 0] } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.58, 0.72, 0.88, 1], ease: "easeOut" }}
        />
        <path d="M12 3.2C12.18 3.2 12.35 3.21 12.53 3.24C12.7 3.26 12.87 3.29 13.05 3.34C13.22 3.39 13.39 3.44 13.57 3.51C13.74 3.58 13.91 3.66 14.08 3.75C14.25 3.85 14.42 3.95 14.58 4.06C14.75 4.17 14.91 4.3 15.08 4.43C15.24 4.57 15.4 4.71 15.55 4.86C15.71 5.02 15.87 5.18 16.02 5.35C16.17 5.52 16.32 5.71 16.46 5.89C16.6 6.08 16.74 6.28 16.88 6.49C17.02 6.69 17.15 6.9 17.27 7.12C17.4 7.34 17.52 7.57 17.64 7.8C17.75 8.03 17.86 8.27 17.97 8.51C18.07 8.75 18.17 9 18.26 9.25C18.35 9.5 18.44 9.76 18.52 10.02C18.59 10.28 18.66 10.54 18.73 10.8C18.79 11.07 18.84 11.33 18.89 11.6C18.93 11.86 18.97 12.13 19 12.4C19.03 12.67 19.05 12.94 19.06 13.2C19.07 13.47 19.07 13.73 19.06 14C19.05 14.26 19.03 14.52 19.01 14.78C18.98 15.04 18.94 15.3 18.89 15.55C18.84 15.8 18.79 16.05 18.72 16.29C18.65 16.53 18.57 16.77 18.49 17C18.4 17.23 18.3 17.46 18.19 17.68C18.09 17.9 17.97 18.11 17.84 18.31C17.72 18.52 17.58 18.72 17.44 18.91C17.3 19.09 17.14 19.28 16.98 19.45C16.82 19.62 16.65 19.78 16.48 19.94C16.3 20.09 16.11 20.23 15.92 20.37C15.73 20.5 15.54 20.63 15.33 20.74C15.13 20.85 14.92 20.95 14.71 21.05C14.5 21.14 14.28 21.22 14.06 21.29C13.84 21.36 13.61 21.41 13.38 21.46C13.16 21.51 12.93 21.54 12.7 21.56C12.46 21.59 12.23 21.6 12 21.6C11.77 21.6 11.54 21.59 11.3 21.56C11.07 21.54 10.84 21.51 10.62 21.46C10.39 21.41 10.16 21.36 9.94 21.29C9.72 21.22 9.5 21.14 9.29 21.05C9.08 20.95 8.87 20.85 8.67 20.74C8.46 20.63 8.27 20.5 8.08 20.37C7.89 20.23 7.7 20.09 7.52 19.94C7.35 19.78 7.18 19.62 7.02 19.45C6.86 19.28 6.7 19.09 6.56 18.91C6.42 18.72 6.28 18.52 6.16 18.31C6.03 18.11 5.91 17.9 5.81 17.68C5.7 17.46 5.6 17.23 5.51 17C5.43 16.77 5.35 16.53 5.28 16.29C5.21 16.05 5.16 15.8 5.11 15.55C5.06 15.3 5.02 15.04 4.99 14.78C4.97 14.52 4.95 14.26 4.94 14C4.93 13.73 4.93 13.47 4.94 13.2C4.95 12.94 4.97 12.67 5 12.4C5.03 12.13 5.07 11.86 5.11 11.6C5.16 11.33 5.21 11.07 5.27 10.8C5.34 10.54 5.41 10.28 5.48 10.02C5.56 9.76 5.65 9.5 5.74 9.25C5.83 9 5.93 8.75 6.03 8.51C6.14 8.27 6.25 8.03 6.36 7.8C6.48 7.57 6.6 7.34 6.73 7.12C6.85 6.9 6.98 6.69 7.12 6.49C7.26 6.28 7.4 6.08 7.54 5.89C7.68 5.71 7.83 5.52 7.98 5.35C8.13 5.18 8.29 5.02 8.45 4.86C8.6 4.71 8.76 4.57 8.92 4.43C9.09 4.3 9.25 4.17 9.42 4.06C9.58 3.95 9.75 3.85 9.92 3.75C10.09 3.66 10.26 3.58 10.43 3.51C10.61 3.44 10.78 3.39 10.95 3.34C11.13 3.29 11.3 3.26 11.47 3.24C11.65 3.21 11.82 3.2 12 3.2Z" />
        <path d="M10.99 6.26C10.96 6.28 10.86 6.35 10.79 6.4C10.73 6.45 10.66 6.5 10.59 6.56C10.52 6.62 10.44 6.69 10.37 6.76C10.3 6.83 10.23 6.9 10.15 6.98C10.08 7.06 10 7.14 9.93 7.23C9.86 7.32 9.78 7.41 9.71 7.5C9.64 7.6 9.56 7.7 9.49 7.8C9.42 7.91 9.34 8.02 9.27 8.13C9.2 8.24 9.13 8.36 9.06 8.47C9 8.59 8.9 8.78 8.86 8.84" strokeWidth={strokeWidth * 0.75} />
      </motion.g>

      </g>
    </svg>
  );
}
