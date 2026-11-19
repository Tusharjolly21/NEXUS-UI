"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CrabIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff453a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The crab scuttles sideways and back while it snaps both pincers shut twice. */
export function CrabIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CrabIconProps) {
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
      <g transform="translate(0 -0.33)">

      <motion.g
        initial={false}
        animate={on ? { x: [0, -1.3, 1.3, -0.7, 0] } : { x: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.22, 0.55, 0.8, 1], ease: "easeInOut" }}
      >
        <motion.path
          d="M16.41 11.9L17.73 9.08M19.18 4.75A2.3 2.3 0 1 1 16.51 6.29M7.59 11.9L6.27 9.08M7.49 6.29A2.3 2.3 0 1 1 4.82 4.75"
          stroke={accent}
          initial={false}
          animate={on ? { d: ["M16.41 11.9L17.73 9.08M19.18 4.75A2.3 2.3 0 1 1 16.51 6.29M7.59 11.9L6.27 9.08M7.49 6.29A2.3 2.3 0 1 1 4.82 4.75", "M16.41 11.9L17.73 9.08M17.8 4.88A2.3 2.3 0 1 1 17.32 5.16M7.59 11.9L6.27 9.08M6.68 5.16A2.3 2.3 0 1 1 6.2 4.88", "M16.41 11.9L17.73 9.08M19.18 4.75A2.3 2.3 0 1 1 16.51 6.29M7.59 11.9L6.27 9.08M7.49 6.29A2.3 2.3 0 1 1 4.82 4.75", "M16.41 11.9L17.73 9.08M17.8 4.88A2.3 2.3 0 1 1 17.32 5.16M7.59 11.9L6.27 9.08M6.68 5.16A2.3 2.3 0 1 1 6.2 4.88", "M16.41 11.9L17.73 9.08M19.18 4.75A2.3 2.3 0 1 1 16.51 6.29M7.59 11.9L6.27 9.08M7.49 6.29A2.3 2.3 0 1 1 4.82 4.75", "M16.41 11.9L17.73 9.08M19.18 4.75A2.3 2.3 0 1 1 16.51 6.29M7.59 11.9L6.27 9.08M7.49 6.29A2.3 2.3 0 1 1 4.82 4.75"] } : { d: "M16.41 11.9L17.73 9.08M19.18 4.75A2.3 2.3 0 1 1 16.51 6.29M7.59 11.9L6.27 9.08M7.49 6.29A2.3 2.3 0 1 1 4.82 4.75" }}
          transition={{ duration: 0.9 / speed, times: [0, 0.14, 0.32, 0.48, 0.66, 1], ease: "easeInOut" }}
        />
        <path d="M17.38 15.37L19.71 15.96M6.62 15.37L4.29 15.96M16.29 16.81L18.18 18.28M7.71 16.81L5.82 18.28M14.45 17.81L15.58 19.92M9.55 17.81L8.42 19.92" />
        <path d="M10 10.66V7.6M14 10.66V7.6" />
        <path d="M6.4 14.3A5.6 3.9 0 1 1 17.6 14.3A5.6 3.9 0 1 1 6.4 14.3Z" />
        <circle cx="10" cy="7.6" r="1.25" fill="currentColor" stroke="none" />
        <circle cx="14" cy="7.6" r="1.25" fill="currentColor" stroke="none" />
      </motion.g>

      </g>
    </svg>
  );
}
