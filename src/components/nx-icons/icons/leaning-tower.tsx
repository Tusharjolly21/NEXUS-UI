"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LeaningTowerIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff6b35. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The tower leans a little further and lets a ball drop from the top, which bounces on the ground as the tower rocks back. */
export function LeaningTowerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LeaningTowerIconProps) {
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
      <g transform="translate(-0.12 -0.79)">

      <motion.circle
        cx="17.94"
        cy="6.29"
        r="1.15"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { y: [0, 0, 12.56, 10.96, 12.56, 12.56], opacity: [0, 1, 1, 1, 1, 0] } : { y: 0, opacity: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.2, 0.5, 0.62, 0.74, 0.92], ease: ["linear", "easeIn", "easeOut", "easeIn", "linear"] }}
      />
      <motion.path
        d="M6.76 21L8.75 8.39A0.8 0.8 0 0 1 9.67 7.72L10.16 7.8L10.54 5.43A1 1 0 0 1 11.68 4.6L14.25 5.01A1 1 0 0 1 15.08 6.15L14.71 8.52L15.2 8.6A0.8 0.8 0 0 1 15.86 9.51L14.04 21"
        initial={false}
        animate={on ? { d: ["M6.76 21L8.75 8.39A0.8 0.8 0 0 1 9.67 7.72L10.16 7.8L10.54 5.43A1 1 0 0 1 11.68 4.6L14.25 5.01A1 1 0 0 1 15.08 6.15L14.71 8.52L15.2 8.6A0.8 0.8 0 0 1 15.86 9.51L14.04 21", "M6.73 21L9.19 8.34A0.8 0.8 0 0 1 10.13 7.7L10.62 7.8L11.08 5.44A1 1 0 0 1 12.25 4.65L14.81 5.15A1 1 0 0 1 15.6 6.32L15.14 8.68L15.63 8.77A0.8 0.8 0 0 1 16.26 9.71L14.07 21", "M6.73 21L9.19 8.34A0.8 0.8 0 0 1 10.13 7.7L10.62 7.8L11.08 5.44A1 1 0 0 1 12.25 4.65L14.81 5.15A1 1 0 0 1 15.6 6.32L15.14 8.68L15.63 8.77A0.8 0.8 0 0 1 16.26 9.71L14.07 21", "M6.76 21L8.58 8.41A0.8 0.8 0 0 1 9.48 7.73L9.98 7.8L10.32 5.43A1 1 0 0 1 11.45 4.58L14.03 4.95A1 1 0 0 1 14.87 6.09L14.53 8.46L15.03 8.53A0.8 0.8 0 0 1 15.7 9.44L14.04 21", "M6.75 21L8.86 8.37A0.8 0.8 0 0 1 9.78 7.72L10.28 7.8L10.67 5.43A1 1 0 0 1 11.82 4.61L14.39 5.04A1 1 0 0 1 15.21 6.19L14.81 8.56L15.31 8.64A0.8 0.8 0 0 1 15.96 9.56L14.05 21", "M6.76 21L8.75 8.39A0.8 0.8 0 0 1 9.67 7.72L10.16 7.8L10.54 5.43A1 1 0 0 1 11.68 4.6L14.25 5.01A1 1 0 0 1 15.08 6.15L14.71 8.52L15.2 8.6A0.8 0.8 0 0 1 15.86 9.51L14.04 21"] } : { d: "M6.76 21L8.75 8.39A0.8 0.8 0 0 1 9.67 7.72L10.16 7.8L10.54 5.43A1 1 0 0 1 11.68 4.6L14.25 5.01A1 1 0 0 1 15.08 6.15L14.71 8.52L15.2 8.6A0.8 0.8 0 0 1 15.86 9.51L14.04 21" }}
        transition={{ duration: 1 / speed, times: [0, 0.16, 0.24, 0.5, 0.72, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M7.35 17.23L14.46 18.35M7.86 14.02L14.97 15.14M8.37 10.81L15.48 11.93"
        initial={false}
        animate={on ? { d: ["M7.35 17.23L14.46 18.35M7.86 14.02L14.97 15.14M8.37 10.81L15.48 11.93", "M7.49 17.12L14.55 18.5M8.11 13.93L15.17 15.31M8.73 10.74L15.79 12.12", "M7.49 17.12L14.55 18.5M8.11 13.93L15.17 15.31M8.73 10.74L15.79 12.12", "M7.3 17.27L14.43 18.3M7.76 14.05L14.89 15.08M8.23 10.84L15.35 11.86", "M7.39 17.2L14.49 18.39M7.92 13.99L15.02 15.18M8.46 10.79L15.56 11.98", "M7.35 17.23L14.46 18.35M7.86 14.02L14.97 15.14M8.37 10.81L15.48 11.93"] } : { d: "M7.35 17.23L14.46 18.35M7.86 14.02L14.97 15.14M8.37 10.81L15.48 11.93" }}
        transition={{ duration: 1 / speed, times: [0, 0.16, 0.24, 0.5, 0.72, 1], ease: "easeInOut" }}
      />
      <path d="M3.6 21H20.6" />
      </g>
    </svg>
  );
}
