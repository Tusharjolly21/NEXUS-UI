"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GiraffeIconProps = {
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

/** The giraffe dips its long neck forward to nibble, then lifts its head back up with a little nod. */
export function GiraffeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GiraffeIconProps) {
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
      <g transform="translate(-0.21 0.96)">

      <path d="M12 14.8V20.6M14.2 14.8V20.6M17.6 14.8V20.6M19.8 14.8V20.6" strokeWidth={strokeWidth * 0.75} />
      <path d="M20.66 11.85L21.8 14.0" strokeWidth={strokeWidth * 0.75} />
      <circle cx="12.2" cy="11.25" r="0.75" fill={accent} stroke="none" /><circle cx="14.4" cy="12.15" r="0.75" fill={accent} stroke="none" /><circle cx="16.6" cy="12.3" r="0.75" fill={accent} stroke="none" />
      <motion.g
        style={{ originX: "49.17%", originY: "46.67%" }}
        initial={false}
        animate={on ? { rotate: [0, -4, -8, -4, 0, 3, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M5.3 3.9V2.3M7.6 3.34V1.74" />
        <circle cx="5.3" cy="2.3" r="0.85" fill="currentColor" stroke="none" /><circle cx="7.6" cy="1.74" r="0.85" fill="currentColor" stroke="none" />
      </motion.g>
      <motion.path
        d="M3.63 6.61A0.9 0.9 0 0 1 2.97 5.56L3.09 4.96A0.9 0.9 0 0 1 3.76 4.27L8.16 3.21A0.6 0.6 0 0 1 8.24 3.2L11 2.91A0.3 0.3 0 0 1 11.22 3.44L10.19 4.28A0.5 0.5 0 0 0 10.12 4.99L13.36 8.87A1.8 1.8 0 0 0 14.48 9.5L19.13 10.18A1.8 1.8 0 0 1 20.67 11.88L20.75 13.75A1 1 0 0 1 19.75 14.8L11.64 14.8A1.2 1.2 0 0 1 10.51 14.01L10.02 12.66A1.4 1.4 0 0 0 9.97 12.54L7.53 7.31A1 1 0 0 0 6.43 6.75L5.42 6.96A1 1 0 0 1 4.98 6.95Z"
        initial={false}
        animate={on ? { d: ["M3.63 6.61A0.9 0.9 0 0 1 2.97 5.56L3.09 4.96A0.9 0.9 0 0 1 3.76 4.27L8.16 3.21A0.6 0.6 0 0 1 8.24 3.2L11 2.91A0.3 0.3 0 0 1 11.22 3.44L10.19 4.28A0.5 0.5 0 0 0 10.12 4.99L13.36 8.87A1.8 1.8 0 0 0 14.48 9.5L19.13 10.18A1.8 1.8 0 0 1 20.67 11.88L20.75 13.75A1 1 0 0 1 19.75 14.8L11.64 14.8A1.2 1.2 0 0 1 10.51 14.01L10.02 12.66A1.4 1.4 0 0 0 9.97 12.54L7.53 7.31A1 1 0 0 0 6.43 6.75L5.42 6.96A1 1 0 0 1 4.98 6.95Z", "M3.33 7.19A0.9 0.9 0 0 1 2.6 6.19L2.67 5.59A0.9 0.9 0 0 1 3.3 4.84L7.61 3.48A0.6 0.6 0 0 1 7.69 3.46L10.43 2.98A0.3 0.3 0 0 1 10.68 3.49L9.71 4.41A0.5 0.5 0 0 0 9.69 5.12L13.36 8.94A1.8 1.8 0 0 0 14.39 9.47L19.14 10.18A1.8 1.8 0 0 1 20.67 11.88L20.75 13.75A1 1 0 0 1 19.75 14.8L11.64 14.8A1.2 1.2 0 0 1 10.51 14.01L10.05 12.72A1.4 1.4 0 0 0 9.96 12.52L7.27 7.62A1 1 0 0 0 6.13 7.14L5.14 7.41A1 1 0 0 1 4.7 7.43Z", "M3.07 7.79A0.9 0.9 0 0 1 2.27 6.84L2.3 6.24A0.9 0.9 0 0 1 2.87 5.45L7.09 3.79A0.6 0.6 0 0 1 7.16 3.77L9.86 3.1A0.3 0.3 0 0 1 10.15 3.59L9.24 4.57A0.5 0.5 0 0 0 9.27 5.28L13.36 8.99A1.8 1.8 0 0 0 14.3 9.44L19.14 10.18A1.8 1.8 0 0 1 20.67 11.88L20.75 13.75A1 1 0 0 1 19.75 14.8L11.65 14.8A1.2 1.2 0 0 1 10.52 14L10.08 12.79A1.4 1.4 0 0 0 9.94 12.5L7.03 7.95A1 1 0 0 0 5.86 7.55L4.89 7.89A1 1 0 0 1 4.46 7.94Z", "M3.33 7.19A0.9 0.9 0 0 1 2.6 6.19L2.67 5.59A0.9 0.9 0 0 1 3.3 4.84L7.61 3.48A0.6 0.6 0 0 1 7.69 3.46L10.43 2.98A0.3 0.3 0 0 1 10.68 3.49L9.71 4.41A0.5 0.5 0 0 0 9.69 5.12L13.36 8.94A1.8 1.8 0 0 0 14.39 9.47L19.14 10.18A1.8 1.8 0 0 1 20.67 11.88L20.75 13.75A1 1 0 0 1 19.75 14.8L11.64 14.8A1.2 1.2 0 0 1 10.51 14.01L10.05 12.72A1.4 1.4 0 0 0 9.96 12.52L7.27 7.62A1 1 0 0 0 6.13 7.14L5.14 7.41A1 1 0 0 1 4.7 7.43Z", "M3.63 6.61A0.9 0.9 0 0 1 2.97 5.56L3.09 4.96A0.9 0.9 0 0 1 3.76 4.27L8.16 3.21A0.6 0.6 0 0 1 8.24 3.2L11 2.91A0.3 0.3 0 0 1 11.22 3.44L10.19 4.28A0.5 0.5 0 0 0 10.12 4.99L13.36 8.87A1.8 1.8 0 0 0 14.48 9.5L19.13 10.18A1.8 1.8 0 0 1 20.67 11.88L20.75 13.75A1 1 0 0 1 19.75 14.8L11.64 14.8A1.2 1.2 0 0 1 10.51 14.01L10.02 12.66A1.4 1.4 0 0 0 9.97 12.54L7.53 7.31A1 1 0 0 0 6.43 6.75L5.42 6.96A1 1 0 0 1 4.98 6.95Z", "M3.88 6.19A0.9 0.9 0 0 1 3.28 5.1L3.43 4.52A0.9 0.9 0 0 1 4.13 3.85L8.59 3.03A0.6 0.6 0 0 1 8.66 3.02L11.44 2.87A0.3 0.3 0 0 1 11.63 3.42L10.55 4.21A0.5 0.5 0 0 0 10.45 4.91L13.37 8.82A1.8 1.8 0 0 0 14.55 9.52L19.13 10.19A1.8 1.8 0 0 1 20.67 11.89L20.75 13.75A1 1 0 0 1 19.75 14.8L11.64 14.8A1.2 1.2 0 0 1 10.51 14.01L10 12.61A1.4 1.4 0 0 0 9.98 12.56L7.74 7.09A1 1 0 0 0 6.67 6.48L5.65 6.63A1 1 0 0 1 5.21 6.59Z", "M3.63 6.61A0.9 0.9 0 0 1 2.97 5.56L3.09 4.96A0.9 0.9 0 0 1 3.76 4.27L8.16 3.21A0.6 0.6 0 0 1 8.24 3.2L11 2.91A0.3 0.3 0 0 1 11.22 3.44L10.19 4.28A0.5 0.5 0 0 0 10.12 4.99L13.36 8.87A1.8 1.8 0 0 0 14.48 9.5L19.13 10.18A1.8 1.8 0 0 1 20.67 11.88L20.75 13.75A1 1 0 0 1 19.75 14.8L11.64 14.8A1.2 1.2 0 0 1 10.51 14.01L10.02 12.66A1.4 1.4 0 0 0 9.97 12.54L7.53 7.31A1 1 0 0 0 6.43 6.75L5.42 6.96A1 1 0 0 1 4.98 6.95Z"] } : { d: "M3.63 6.61A0.9 0.9 0 0 1 2.97 5.56L3.09 4.96A0.9 0.9 0 0 1 3.76 4.27L8.16 3.21A0.6 0.6 0 0 1 8.24 3.2L11 2.91A0.3 0.3 0 0 1 11.22 3.44L10.19 4.28A0.5 0.5 0 0 0 10.12 4.99L13.36 8.87A1.8 1.8 0 0 0 14.48 9.5L19.13 10.18A1.8 1.8 0 0 1 20.67 11.88L20.75 13.75A1 1 0 0 1 19.75 14.8L11.64 14.8A1.2 1.2 0 0 1 10.51 14.01L10.02 12.66A1.4 1.4 0 0 0 9.97 12.54L7.53 7.31A1 1 0 0 0 6.43 6.75L5.42 6.96A1 1 0 0 1 4.98 6.95Z" }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      />

      </g>
    </svg>
  );
}
