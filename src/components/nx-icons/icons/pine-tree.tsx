"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PineTreeIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #64d2ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Two gusts of wind sweep past and the tall pine bends with them, its top swaying most, then springs upright. */
export function PineTreeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PineTreeIconProps) {
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
      <motion.path
        d="M2.6 6.2Q5.2 5.3 7.8 6.2"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { pathLength: [0, 1, 1], pathOffset: [0, 0, 1], opacity: [0, 1, 0] } : { pathLength: 0, pathOffset: 0, opacity: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0) / speed, times: [0, 0.5, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M2.2 11.4Q4.3 10.5 6.4 11.4"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { pathLength: [0, 1, 1], pathOffset: [0, 0, 1], opacity: [0, 1, 0] } : { pathLength: 0, pathOffset: 0, opacity: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0.12) / speed, times: [0, 0.5, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M12 2.6C12.9 5.96 14.52 7.1 15.6 8.2Q13.8 8.35 13.7 7.4C14.68 10.88 16.43 12.1 17.6 13.2Q15.8 13.35 14.5 12.4C15.78 15.88 18.07 17.1 19.6 18.2Q17.4 18.35 13.5 17.5L13.5 21.4L10.5 21.4L10.5 17.5Q6.6 18.35 4.4 18.2C5.93 17.1 8.22 15.88 9.5 12.4Q8.2 13.35 6.4 13.2C7.57 12.1 9.32 10.88 10.3 7.4Q10.2 8.35 8.4 8.2C9.48 7.1 11.1 5.96 12 2.6Z"
        initial={false}
        animate={on ? { d: ["M12 2.6C12.9 5.96 14.52 7.1 15.6 8.2Q13.8 8.35 13.7 7.4C14.68 10.88 16.43 12.1 17.6 13.2Q15.8 13.35 14.5 12.4C15.78 15.88 18.07 17.1 19.6 18.2Q17.4 18.35 13.5 17.5L13.5 21.4L10.5 21.4L10.5 17.5Q6.6 18.35 4.4 18.2C5.93 17.1 8.22 15.88 9.5 12.4Q8.2 13.35 6.4 13.2C7.57 12.1 9.32 10.88 10.3 7.4Q10.2 8.35 8.4 8.2C9.48 7.1 11.1 5.96 12 2.6Z", "M14.4 2.6C14.52 5.96 15.91 7.1 16.78 8.2Q14.96 8.35 15.03 7.4C15.43 10.88 17.02 12.1 18.06 13.2Q16.24 13.35 15.05 12.4C15.98 15.88 18.2 17.1 19.67 18.2Q17.46 18.35 13.6 17.5L13.5 21.4L10.5 21.4L10.6 17.5Q6.66 18.35 4.47 18.2C6.06 17.1 8.43 15.88 10.05 12.4Q8.64 13.35 6.86 13.2C8.16 12.1 10.08 10.88 11.63 7.4Q11.36 8.35 9.58 8.2C10.87 7.1 12.72 5.96 14.4 2.6Z", "M10.5 2.6C11.89 5.96 13.65 7.1 14.86 8.2Q13.08 8.35 12.87 7.4C14.21 10.88 16.06 12.1 17.31 13.2Q15.52 13.35 14.16 12.4C15.65 15.88 17.99 17.1 19.56 18.2Q17.36 18.35 13.44 17.5L13.5 21.4L10.5 21.4L10.44 17.5Q6.56 18.35 4.36 18.2C5.85 17.1 8.1 15.88 9.16 12.4Q7.92 13.35 6.11 13.2C7.2 12.1 8.86 10.88 9.47 7.4Q9.48 8.35 7.66 8.2C8.61 7.1 10.09 5.96 10.5 2.6Z", "M12.8 2.6C13.44 5.96 14.98 7.1 15.99 8.2Q14.19 8.35 14.14 7.4C14.93 10.88 16.63 12.1 17.75 13.2Q15.95 13.35 14.68 12.4C15.84 15.88 18.11 17.1 19.62 18.2Q17.42 18.35 13.53 17.5L13.5 21.4L10.5 21.4L10.53 17.5Q6.62 18.35 4.42 18.2C5.97 17.1 8.29 15.88 9.68 12.4Q8.35 13.35 6.55 13.2C7.77 12.1 9.58 10.88 10.74 7.4Q10.59 8.35 8.79 8.2C9.94 7.1 11.64 5.96 12.8 2.6Z", "M12 2.6C12.9 5.96 14.52 7.1 15.6 8.2Q13.8 8.35 13.7 7.4C14.68 10.88 16.43 12.1 17.6 13.2Q15.8 13.35 14.5 12.4C15.78 15.88 18.07 17.1 19.6 18.2Q17.4 18.35 13.5 17.5L13.5 21.4L10.5 21.4L10.5 17.5Q6.6 18.35 4.4 18.2C5.93 17.1 8.22 15.88 9.5 12.4Q8.2 13.35 6.4 13.2C7.57 12.1 9.32 10.88 10.3 7.4Q10.2 8.35 8.4 8.2C9.48 7.1 11.1 5.96 12 2.6Z"] } : { d: "M12 2.6C12.9 5.96 14.52 7.1 15.6 8.2Q13.8 8.35 13.7 7.4C14.68 10.88 16.43 12.1 17.6 13.2Q15.8 13.35 14.5 12.4C15.78 15.88 18.07 17.1 19.6 18.2Q17.4 18.35 13.5 17.5L13.5 21.4L10.5 21.4L10.5 17.5Q6.6 18.35 4.4 18.2C5.93 17.1 8.22 15.88 9.5 12.4Q8.2 13.35 6.4 13.2C7.57 12.1 9.32 10.88 10.3 7.4Q10.2 8.35 8.4 8.2C9.48 7.1 11.1 5.96 12 2.6Z" }}
        transition={{ duration: 1 / speed, times: [0, 0.3, 0.56, 0.8, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
