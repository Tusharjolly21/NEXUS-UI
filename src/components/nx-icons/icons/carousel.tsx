"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CarouselIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff2d55. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The two carousel horses ride up and down their poles in turn, like a merry go round in motion. */
export function CarouselIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CarouselIconProps) {
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
      <g transform="translate(0 -0.01)">

      <path d="M7.8 7.6V21.4M16.2 7.6V21.4" />
      <motion.path
        d="M5.5 14.61A0.54 0.54 0 0 1 5.82 14.5L8.21 14.5A0.36 0.36 0 0 0 8.44 14.41L8.84 14.08A0.36 0.36 0 0 0 8.95 13.9L9.22 12.94A0.45 0.45 0 0 1 9.27 12.83L9.59 12.31A0.18 0.18 0 0 0 9.61 12.28L9.73 11.96A0.14 0.14 0 0 1 9.97 11.94L10.17 12.27A0.27 0.27 0 0 0 10.2 12.32L11.04 13.19A0.27 0.27 0 0 1 11.09 13.5L11.02 13.64A0.18 0.18 0 0 1 10.8 13.73L10.31 13.57A0.18 0.18 0 0 0 10.08 13.68L9.89 14.22A0.27 0.27 0 0 0 9.88 14.34L9.94 14.98A0.27 0.27 0 0 0 10.1 15.19L10.64 15.45A0.27 0.27 0 0 1 10.79 15.73L10.67 16.62A0.23 0.23 0 0 1 10.41 16.81L10.24 16.78A0.23 0.23 0 0 1 10.05 16.52L10.11 16.22A0.18 0.18 0 0 0 10 16.02L9.39 15.78A0.36 0.36 0 0 0 9.26 15.76L6.82 15.76A0.36 0.36 0 0 0 6.63 15.81L6.01 16.2A0.27 0.27 0 0 1 5.98 16.22L5.04 16.66A0.23 0.23 0 0 1 4.74 16.54L4.67 16.4A0.23 0.23 0 0 1 4.72 16.14L5.24 15.62A0.18 0.18 0 0 0 5.29 15.43L5.19 15.15A0.36 0.36 0 0 1 5.31 14.75Z"
        fill={accent}
        stroke={accent}
        strokeWidth={strokeWidth * 0.5}
        initial={false}
        animate={on ? { y: [0, -0.9, 0, -0.9, 0] } : { y: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M13.9 16.01A0.54 0.54 0 0 1 14.22 15.9L16.61 15.9A0.36 0.36 0 0 0 16.84 15.81L17.24 15.48A0.36 0.36 0 0 0 17.35 15.3L17.62 14.34A0.45 0.45 0 0 1 17.67 14.23L17.99 13.71A0.18 0.18 0 0 0 18.01 13.68L18.13 13.36A0.14 0.14 0 0 1 18.37 13.34L18.57 13.67A0.27 0.27 0 0 0 18.6 13.72L19.44 14.59A0.27 0.27 0 0 1 19.49 14.9L19.42 15.04A0.18 0.18 0 0 1 19.2 15.13L18.71 14.97A0.18 0.18 0 0 0 18.48 15.08L18.29 15.62A0.27 0.27 0 0 0 18.28 15.74L18.34 16.38A0.27 0.27 0 0 0 18.5 16.59L19.04 16.85A0.27 0.27 0 0 1 19.19 17.13L19.07 18.02A0.23 0.23 0 0 1 18.81 18.21L18.64 18.18A0.23 0.23 0 0 1 18.45 17.92L18.51 17.62A0.18 0.18 0 0 0 18.4 17.42L17.79 17.18A0.36 0.36 0 0 0 17.66 17.16L15.22 17.16A0.36 0.36 0 0 0 15.03 17.21L14.41 17.6A0.27 0.27 0 0 1 14.38 17.62L13.44 18.06A0.23 0.23 0 0 1 13.14 17.94L13.07 17.8A0.23 0.23 0 0 1 13.12 17.54L13.64 17.02A0.18 0.18 0 0 0 13.69 16.83L13.59 16.55A0.36 0.36 0 0 1 13.71 16.15Z"
        fill={accent}
        stroke={accent}
        strokeWidth={strokeWidth * 0.5}
        initial={false}
        animate={on ? { y: [0, 0.9, 0, 0.9, 0] } : { y: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
      />
      <path d="M20.4 7.6L20.4 6.8A0.6 0.6 0 0 0 20.04 6.24L12.32 2.94A0.8 0.8 0 0 0 11.68 2.94L3.96 6.24A0.6 0.6 0 0 0 3.6 6.8L3.6 7.6Q5.7 9.6 7.8 7.6Q9.9 9.6 12 7.6Q14.1 9.6 16.2 7.6Q18.3 9.6 20.4 7.6Z" />
      <path d="M12 2.8V2.6" />
      <path d="M3.6 21.4H20.4" />
      </g>
    </svg>
  );
}
