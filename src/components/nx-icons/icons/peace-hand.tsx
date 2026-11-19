"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PeaceHandIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #a855f7. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The hand rocks while the two raised fingers spread wider into a V and a small sparkle twinkles by their tips. */
export function PeaceHandIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PeaceHandIconProps) {
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
      <g transform="translate(-0.06 0.06)">

      <motion.path
        d="M19.2 2.6L19.73 4.07L21.2 4.6L19.73 5.13L19.2 6.6L18.67 5.13L17.2 4.6L18.67 4.07Z"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [0, 0, 1.2, 0.9, 0, 0], rotate: [0, 0, 45, 70, 90, 0] } : { scale: 0, rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.2, 0.42, 0.62, 0.86, 1], ease: "easeOut" }}
      />
      <motion.g
        style={{ originX: "50%", originY: "87.5%" }}
        initial={false}
        animate={on ? { rotate: [0, -7, 5, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.24, 0.5, 0.75, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M9.83 10.39L11.17 4.09A1.5 1.5 0 0 1 14.11 4.71L14.11 4.71L12.81 10.83A0.8 0.8 0 0 0 13.59 11.8L17.1 11.8A1.5 1.5 0 0 1 18.6 13.3L18.6 17.02A2.6 2.6 0 0 1 18.17 18.45L16.96 20.28A1.6 1.6 0 0 1 15.62 21L9.74 21A1.6 1.6 0 0 1 8.41 20.28L7.2 18.45A2.6 2.6 0 0 1 6.77 17.02L6.77 10.49A0.9 0.9 0 0 0 6.75 10.31L5.56 4.71A1.5 1.5 0 0 1 8.49 4.09Z"
          initial={false}
          animate={on ? { d: ["M9.83 10.39L11.17 4.09A1.5 1.5 0 0 1 14.11 4.71L14.11 4.71L12.81 10.83A0.8 0.8 0 0 0 13.59 11.8L17.1 11.8A1.5 1.5 0 0 1 18.6 13.3L18.6 17.02A2.6 2.6 0 0 1 18.17 18.45L16.96 20.28A1.6 1.6 0 0 1 15.62 21L9.74 21A1.6 1.6 0 0 1 8.41 20.28L7.2 18.45A2.6 2.6 0 0 1 6.77 17.02L6.77 10.49A0.9 0.9 0 0 0 6.75 10.31L5.56 4.71A1.5 1.5 0 0 1 8.49 4.09Z", "M9.87 10.48L12 3.94A1.5 1.5 0 0 1 14.85 4.86L14.85 4.86L12.94 10.75A0.8 0.8 0 0 0 13.7 11.8L17.1 11.8A1.5 1.5 0 0 1 18.6 13.3L18.6 17.01A2.6 2.6 0 0 1 18.16 18.46L16.92 20.29A1.6 1.6 0 0 1 15.59 21L9.7 21A1.6 1.6 0 0 1 8.37 20.29L7.14 18.46A2.6 2.6 0 0 1 6.69 17.01L6.69 10.54A0.9 0.9 0 0 0 6.65 10.26L4.89 4.86A1.5 1.5 0 0 1 7.75 3.94Z", "M9.87 10.48L12 3.94A1.5 1.5 0 0 1 14.85 4.86L14.85 4.86L12.94 10.75A0.8 0.8 0 0 0 13.7 11.8L17.1 11.8A1.5 1.5 0 0 1 18.6 13.3L18.6 17.01A2.6 2.6 0 0 1 18.16 18.46L16.92 20.29A1.6 1.6 0 0 1 15.59 21L9.7 21A1.6 1.6 0 0 1 8.37 20.29L7.14 18.46A2.6 2.6 0 0 1 6.69 17.01L6.69 10.54A0.9 0.9 0 0 0 6.65 10.26L4.89 4.86A1.5 1.5 0 0 1 7.75 3.94Z", "M9.82 10.23L10.84 4.15A1.5 1.5 0 0 1 13.8 4.65L13.8 4.65L12.76 10.87A0.8 0.8 0 0 0 13.54 11.8L17.1 11.8A1.5 1.5 0 0 1 18.6 13.3L18.6 17.02A2.6 2.6 0 0 1 18.17 18.45L16.98 20.28A1.6 1.6 0 0 1 15.64 21L9.77 21A1.6 1.6 0 0 1 8.43 20.28L7.23 18.45A2.6 2.6 0 0 1 6.81 17.02L6.81 10.47A0.9 0.9 0 0 0 6.79 10.33L5.84 4.65A1.5 1.5 0 0 1 8.8 4.15Z", "M9.83 10.39L11.17 4.09A1.5 1.5 0 0 1 14.11 4.71L14.11 4.71L12.81 10.83A0.8 0.8 0 0 0 13.59 11.8L17.1 11.8A1.5 1.5 0 0 1 18.6 13.3L18.6 17.02A2.6 2.6 0 0 1 18.17 18.45L16.96 20.28A1.6 1.6 0 0 1 15.62 21L9.74 21A1.6 1.6 0 0 1 8.41 20.28L7.2 18.45A2.6 2.6 0 0 1 6.77 17.02L6.77 10.49A0.9 0.9 0 0 0 6.75 10.31L5.56 4.71A1.5 1.5 0 0 1 8.49 4.09Z"] } : { d: "M9.83 10.39L11.17 4.09A1.5 1.5 0 0 1 14.11 4.71L14.11 4.71L12.81 10.83A0.8 0.8 0 0 0 13.59 11.8L17.1 11.8A1.5 1.5 0 0 1 18.6 13.3L18.6 17.02A2.6 2.6 0 0 1 18.17 18.45L16.96 20.28A1.6 1.6 0 0 1 15.62 21L9.74 21A1.6 1.6 0 0 1 8.41 20.28L7.2 18.45A2.6 2.6 0 0 1 6.77 17.02L6.77 10.49A0.9 0.9 0 0 0 6.75 10.31L5.56 4.71A1.5 1.5 0 0 1 8.49 4.09Z" }}
          transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.55, 0.78, 1], ease: "easeInOut" }}
        />
        <path d="M6.77 14H14.2A1.5 1.5 0 0 1 14.2 17H6.77" />
      </motion.g>
      </g>
    </svg>
  );
}
