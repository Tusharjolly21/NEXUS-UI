"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SushiIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff7a45. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A piece of salmon nigiri hops, lands on the plate with a jelly squash and wobbles still. */
export function SushiIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SushiIconProps) {
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
      <g transform="translate(0 -2)">

      <motion.g
        style={{ originX: "50%", originY: "85%" }}
        initial={false}
        animate={on ? { y: [0, -2.6, 0, 0, 0, 0], scaleY: [1, 1.04, 0.86, 1.05, 0.98, 1], scaleX: [1, 0.98, 1.08, 0.97, 1.01, 1] } : { y: 0, scaleY: 1, scaleX: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.28, 0.5, 0.66, 0.82, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g fill={accent} stroke="none">
        <path d="M2.53 14.23L2.58 13.96L2.69 13.53L2.82 13.12L2.97 12.72L3.14 12.34L3.33 11.97L3.55 11.62L3.78 11.28L4.03 10.96L4.3 10.65L4.58 10.36L4.88 10.08L5.19 9.82L5.52 9.57L5.86 9.34L6.22 9.12L6.58 8.92L6.96 8.73L7.34 8.56L7.74 8.4L8.14 8.26L8.55 8.13L8.97 8.02L9.39 7.92L9.82 7.84L10.25 7.77L10.68 7.72L11.12 7.68L11.56 7.66L12 7.65L12.44 7.66L12.88 7.68L13 7.69Z" />
        <path d="M14.47 7.89L14.61 7.92L15.03 8.02L15.45 8.13L15.86 8.26L16.26 8.4L16.66 8.56L17.04 8.73L17.42 8.92L17.64 9.04L10.84 13.29L10.57 13.29L10.22 13.31L9.86 13.32L9.51 13.34L9.16 13.36L8.82 13.38L8.47 13.4L8.13 13.43L7.79 13.45L7.45 13.49L7.12 13.52L6.79 13.56L6.47 13.6L6.15 13.64L5.83 13.68L5.52 13.73L5.21 13.78L5 13.81Z" />
        <path d="M18.53 9.61L18.81 9.82L19.12 10.08L19.42 10.36L19.7 10.65L19.97 10.96L20.22 11.28L20.41 11.55L17.2 13.56L16.88 13.52L16.55 13.49L16.21 13.45L15.87 13.43L15.53 13.4L15.18 13.38L14.84 13.35L14.49 13.34L14.14 13.32L13.78 13.31L13.43 13.29L13.07 13.29L12.71 13.28L12.65 13.28Z" />
        <path d="M20.88 12.38L21.03 12.72L21.18 13.12L21.31 13.53L21.42 13.96L21.5 14.4L21.26 14.33L21.01 14.25L20.76 14.19L20.5 14.12L20.23 14.06L19.95 14L19.67 13.94L19.38 13.88L19.09 13.83L18.79 13.78L18.67 13.76Z" />
        </g>
        <path d="M2.5 14.4C3.9 5.4 20.1 5.4 21.5 14.4C16.8 12.9 7.2 12.9 2.5 14.4Z" />
        <path d="M19.03 13.82C19.08 13.88 19.25 14.06 19.35 14.2C19.45 14.33 19.54 14.48 19.62 14.62C19.7 14.77 19.77 14.92 19.83 15.08C19.89 15.23 19.94 15.39 19.98 15.55C20.02 15.71 20.05 15.88 20.07 16.05C20.09 16.21 20.1 16.38 20.1 16.55C20.1 16.71 20.08 16.88 20.06 17.05C20.04 17.21 20 17.38 19.96 17.54C19.91 17.7 19.86 17.86 19.8 18.01C19.73 18.16 19.65 18.31 19.57 18.46C19.49 18.6 19.39 18.74 19.29 18.87C19.19 19.01 19.08 19.13 18.96 19.25C18.85 19.37 18.72 19.48 18.59 19.58C18.45 19.68 18.31 19.78 18.17 19.86C18.03 19.95 17.88 20.02 17.72 20.09C17.57 20.15 17.41 20.21 17.25 20.25C17.09 20.3 16.93 20.33 16.76 20.36C16.6 20.38 16.43 20.39 16.26 20.4C16.09 20.4 15.93 20.4 15.76 20.4C15.59 20.4 15.43 20.4 15.26 20.4C15.09 20.4 14.92 20.4 14.76 20.4C14.59 20.4 14.42 20.4 14.26 20.4C14.09 20.4 13.92 20.4 13.75 20.4C13.59 20.4 13.42 20.4 13.25 20.4C13.09 20.4 12.92 20.4 12.75 20.4C12.58 20.4 12.42 20.4 12.25 20.4C12.08 20.4 11.92 20.4 11.75 20.4C11.58 20.4 11.42 20.4 11.25 20.4C11.08 20.4 10.91 20.4 10.75 20.4C10.58 20.4 10.41 20.4 10.25 20.4C10.08 20.4 9.91 20.4 9.74 20.4C9.58 20.4 9.41 20.4 9.24 20.4C9.08 20.4 8.91 20.4 8.74 20.4C8.57 20.4 8.41 20.4 8.24 20.4C8.07 20.4 7.91 20.4 7.74 20.4C7.57 20.39 7.4 20.38 7.24 20.36C7.07 20.33 6.91 20.3 6.75 20.25C6.59 20.21 6.43 20.15 6.28 20.09C6.12 20.02 5.97 19.95 5.83 19.86C5.69 19.78 5.55 19.68 5.41 19.58C5.28 19.48 5.15 19.37 5.04 19.25C4.92 19.13 4.81 19.01 4.71 18.87C4.61 18.74 4.51 18.6 4.43 18.46C4.35 18.31 4.27 18.16 4.2 18.01C4.14 17.86 4.09 17.7 4.04 17.54C4 17.38 3.96 17.21 3.94 17.05C3.92 16.88 3.9 16.71 3.9 16.55C3.9 16.38 3.91 16.21 3.93 16.05C3.95 15.88 3.98 15.71 4.02 15.55C4.06 15.39 4.11 15.23 4.17 15.08C4.23 14.92 4.3 14.77 4.38 14.62C4.46 14.48 4.55 14.33 4.65 14.2C4.75 14.06 4.92 13.88 4.97 13.82" />
      </motion.g>

      </g>
    </svg>
  );
}
