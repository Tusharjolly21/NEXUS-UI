"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HoneyJarIconProps = {
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

/** Honey oozes over the rim of the jar, one drip stretches long and a golden drop falls off and fades. */
export function HoneyJarIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HoneyJarIconProps) {
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
      <g transform="translate(0 -0.88)">

      <motion.path
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { d: ["M4.6 11.4L4.8 11.4L5 11.4L5.2 11.4L5.4 11.4L5.6 11.4L5.8 11.4L6 11.4L6.2 11.4L6.4 11.71L6.6 12.37L6.8 13.07L7 13.7L7.2 14.19L7.4 14.5L7.6 14.6L7.8 14.5L8 14.19L8.2 13.7L8.4 13.07L8.6 12.37L8.8 11.71L9 11.4L9.2 11.4L9.4 11.4L9.6 11.4L9.8 11.4L10 11.4L10.2 11.4L10.4 11.4L10.6 11.4L10.8 11.4L11 11.4L11.2 11.47L11.4 11.75L11.6 12.06L11.8 12.37L12 12.63L12.2 12.83L12.4 12.96L12.6 13L12.8 12.96L13 12.83L13.2 12.63L13.4 12.37L13.6 12.06L13.8 11.75L14 11.47L14.2 11.4L14.4 11.4L14.6 11.4L14.8 11.4L15 11.4L15.2 11.4L15.4 11.4L15.6 11.77L15.8 12.31L16 12.83L16.2 13.24L16.4 13.51L16.6 13.6L16.8 13.51L17 13.24L17.2 12.83L17.4 12.31L17.6 11.77L17.8 11.4L18 11.4L18.2 11.4L18.4 11.4L18.6 11.4L18.8 11.4L19 11.4L19.2 11.4L19.4 11.4V11.2A2.2 2.2 0 0 0 17.2 9H6.8A2.2 2.2 0 0 0 4.6 11.2Z", "M4.6 11.4L4.8 11.4L5 11.4L5.2 11.4L5.4 11.4L5.6 11.4L5.8 11.4L6 11.4L6.2 11.4L6.4 11.4L6.6 12.24L6.8 13.47L7 14.65L7.2 15.59L7.4 16.19L7.6 16.4L7.8 16.19L8 15.59L8.2 14.65L8.4 13.47L8.6 12.24L8.8 11.4L9 11.4L9.2 11.4L9.4 11.4L9.6 11.4L9.8 11.4L10 11.4L10.2 11.4L10.4 11.4L10.6 11.4L10.8 11.4L11 11.4L11.2 11.43L11.4 11.74L11.6 12.12L11.8 12.5L12 12.83L12.2 13.09L12.4 13.25L12.6 13.3L12.8 13.25L13 13.09L13.2 12.83L13.4 12.5L13.6 12.12L13.8 11.74L14 11.43L14.2 11.4L14.4 11.4L14.6 11.4L14.8 11.4L15 11.4L15.2 11.4L15.4 11.4L15.6 11.7L15.8 12.33L16 12.95L16.2 13.46L16.4 13.79L16.6 13.9L16.8 13.79L17 13.46L17.2 12.95L17.4 12.33L17.6 11.7L17.8 11.4L18 11.4L18.2 11.4L18.4 11.4L18.6 11.4L18.8 11.4L19 11.4L19.2 11.4L19.4 11.4V11.2A2.2 2.2 0 0 0 17.2 9H6.8A2.2 2.2 0 0 0 4.6 11.2Z", "M4.6 11.4L4.8 11.4L5 11.4L5.2 11.4L5.4 11.4L5.6 11.4L5.8 11.4L6 11.4L6.2 11.4L6.4 11.4L6.6 12.24L6.8 13.47L7 14.65L7.2 15.59L7.4 16.19L7.6 16.4L7.8 16.19L8 15.59L8.2 14.65L8.4 13.47L8.6 12.24L8.8 11.4L9 11.4L9.2 11.4L9.4 11.4L9.6 11.4L9.8 11.4L10 11.4L10.2 11.4L10.4 11.4L10.6 11.4L10.8 11.4L11 11.4L11.2 11.43L11.4 11.74L11.6 12.12L11.8 12.5L12 12.83L12.2 13.09L12.4 13.25L12.6 13.3L12.8 13.25L13 13.09L13.2 12.83L13.4 12.5L13.6 12.12L13.8 11.74L14 11.43L14.2 11.4L14.4 11.4L14.6 11.4L14.8 11.4L15 11.4L15.2 11.4L15.4 11.4L15.6 11.7L15.8 12.33L16 12.95L16.2 13.46L16.4 13.79L16.6 13.9L16.8 13.79L17 13.46L17.2 12.95L17.4 12.33L17.6 11.7L17.8 11.4L18 11.4L18.2 11.4L18.4 11.4L18.6 11.4L18.8 11.4L19 11.4L19.2 11.4L19.4 11.4V11.2A2.2 2.2 0 0 0 17.2 9H6.8A2.2 2.2 0 0 0 4.6 11.2Z", "M4.6 11.4L4.8 11.4L5 11.4L5.2 11.4L5.4 11.4L5.6 11.4L5.8 11.4L6 11.4L6.2 11.4L6.4 11.71L6.6 12.37L6.8 13.07L7 13.7L7.2 14.19L7.4 14.5L7.6 14.6L7.8 14.5L8 14.19L8.2 13.7L8.4 13.07L8.6 12.37L8.8 11.71L9 11.4L9.2 11.4L9.4 11.4L9.6 11.4L9.8 11.4L10 11.4L10.2 11.4L10.4 11.4L10.6 11.4L10.8 11.4L11 11.4L11.2 11.47L11.4 11.75L11.6 12.06L11.8 12.37L12 12.63L12.2 12.83L12.4 12.96L12.6 13L12.8 12.96L13 12.83L13.2 12.63L13.4 12.37L13.6 12.06L13.8 11.75L14 11.47L14.2 11.4L14.4 11.4L14.6 11.4L14.8 11.4L15 11.4L15.2 11.4L15.4 11.4L15.6 11.77L15.8 12.31L16 12.83L16.2 13.24L16.4 13.51L16.6 13.6L16.8 13.51L17 13.24L17.2 12.83L17.4 12.31L17.6 11.77L17.8 11.4L18 11.4L18.2 11.4L18.4 11.4L18.6 11.4L18.8 11.4L19 11.4L19.2 11.4L19.4 11.4V11.2A2.2 2.2 0 0 0 17.2 9H6.8A2.2 2.2 0 0 0 4.6 11.2Z"] } : { d: "M4.6 11.4L4.8 11.4L5 11.4L5.2 11.4L5.4 11.4L5.6 11.4L5.8 11.4L6 11.4L6.2 11.4L6.4 11.71L6.6 12.37L6.8 13.07L7 13.7L7.2 14.19L7.4 14.5L7.6 14.6L7.8 14.5L8 14.19L8.2 13.7L8.4 13.07L8.6 12.37L8.8 11.71L9 11.4L9.2 11.4L9.4 11.4L9.6 11.4L9.8 11.4L10 11.4L10.2 11.4L10.4 11.4L10.6 11.4L10.8 11.4L11 11.4L11.2 11.47L11.4 11.75L11.6 12.06L11.8 12.37L12 12.63L12.2 12.83L12.4 12.96L12.6 13L12.8 12.96L13 12.83L13.2 12.63L13.4 12.37L13.6 12.06L13.8 11.75L14 11.47L14.2 11.4L14.4 11.4L14.6 11.4L14.8 11.4L15 11.4L15.2 11.4L15.4 11.4L15.6 11.77L15.8 12.31L16 12.83L16.2 13.24L16.4 13.51L16.6 13.6L16.8 13.51L17 13.24L17.2 12.83L17.4 12.31L17.6 11.77L17.8 11.4L18 11.4L18.2 11.4L18.4 11.4L18.6 11.4L18.8 11.4L19 11.4L19.2 11.4L19.4 11.4V11.2A2.2 2.2 0 0 0 17.2 9H6.8A2.2 2.2 0 0 0 4.6 11.2Z" }}
        transition={{ duration: 1 / speed, times: [0, 0.4, 0.5, 1], ease: "easeInOut" }}
      />
      <motion.circle
        cx="7.6"
        cy="16.2"
        r="1"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { y: [0, 0, 1.6, 2.4], opacity: [0, 0, 1, 0] } : { y: 0, opacity: 0 }}
        transition={{ duration: 0.75 / speed, delay: (0.3) / speed, times: [0, 0.24, 0.6, 1], ease: "easeIn" }}
      />
      <path d="M6.8 9H17.2A2.2 2.2 0 0 1 19.4 11.2V17.8A3.2 3.2 0 0 1 16.2 21H7.8A3.2 3.2 0 0 1 4.6 17.8V11.2A2.2 2.2 0 0 1 6.8 9Z" />
      <path d="M7 9V6.2A1.4 1.4 0 0 1 8.4 4.8H15.6A1.4 1.4 0 0 1 17 6.2V9" />
      <path d="M12 14.5L13.82 15.55L13.82 17.65L12 18.7L10.18 17.65L10.18 15.55Z" strokeWidth={strokeWidth * 0.75} />

      </g>
    </svg>
  );
}
