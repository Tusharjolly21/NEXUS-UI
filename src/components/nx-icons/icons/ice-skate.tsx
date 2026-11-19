"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type IceSkateIconProps = {
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

/** The skate hops up on its toe and lands on the blade, throwing a little spray of ice. */
export function IceSkateIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: IceSkateIconProps) {
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
      <g transform="translate(-0.79 0.79)">

      <motion.g
        style={{ originX: "84.33%", originY: "81.67%" }}
        initial={false}
        animate={on ? { rotate: [0, 6, 0, 0], y: [0, -1.2, 0, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.55, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M4.8 19.6H18.4A2.4 2.4 0 0 0 20.24 15.66M7.4 14V19.6M16.4 14V19.6" stroke={accent} />
        <path d="M6.32 3.71A1 1 0 0 1 7.31 2.8L10.72 2.8A1 1 0 0 1 11.71 3.67L12.27 7.97A1.6 1.6 0 0 0 13.39 9.3L16.7 10.31A2.4 2.4 0 0 1 17.26 10.56L18.74 11.47A1.8 1.8 0 0 1 19.6 13.01L19.6 13A1 1 0 0 1 18.6 14L6.49 14A1 1 0 0 1 5.5 12.91Z" />
        <path d="M6.15 5.6H11.96" />
      </motion.g>
      <motion.path
        d="M3.11 18.98L1.98 18.57M3.64 18.22L2.87 17.3"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 0, 1, 0], pathLength: [0, 0, 1, 1] } : { opacity: 0, pathLength: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.55, 0.7, 1] }}
      />

      </g>
    </svg>
  );
}
