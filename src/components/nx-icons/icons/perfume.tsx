"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PerfumeIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #d946ef. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The spray cap presses down and a fine mist bursts out of the nozzle and fades away. */
export function PerfumeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PerfumeIconProps) {
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
      <g transform="translate(0.5 0.21)">

      <path d="M8.27 10.63A0.8 0.8 0 0 1 8.83 10.4L14.17 10.4A0.8 0.8 0 0 1 14.73 10.63L17.27 13.17A0.8 0.8 0 0 1 17.5 13.73L17.5 17.67A0.8 0.8 0 0 1 17.27 18.23L14.73 20.77A0.8 0.8 0 0 1 14.17 21L8.83 21A0.8 0.8 0 0 1 8.27 20.77L5.73 18.23A0.8 0.8 0 0 1 5.5 17.67L5.5 13.73A0.8 0.8 0 0 1 5.73 13.17Z" />
      <motion.path
        d="M9.5 10.4V6.6M13.5 10.4V6.6"
        initial={false}
        animate={on ? { d: ["M9.5 10.4V6.6M13.5 10.4V6.6", "M9.5 10.4V7.7M13.5 10.4V7.7", "M9.5 10.4V7.7M13.5 10.4V7.7", "M9.5 10.4V6.6M13.5 10.4V6.6"] } : { d: "M9.5 10.4V6.6M13.5 10.4V6.6" }}
        transition={{ duration: 0.8 / speed, times: [0, 0.2, 0.38, 0.7], ease: "easeInOut" }}
      />
      <motion.g
        initial={false}
        animate={on ? { y: [0, 1.1, 1.1, 0] } : { y: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.2, 0.38, 0.7], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <rect x="8" y="2.6" width="7" height="4" rx="1" />
        <path d="M8 4.6H6.2" />
      </motion.g>
      <motion.g
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        style={{ originX: "25.83%", originY: "19.17%" }}
        initial={false}
        animate={on ? { scale: [0.3, 1.1, 1.15], x: [0, -0.2, -0.4], opacity: [0, 1, 0] } : { scale: 0.3, opacity: 0 }}
        transition={{ duration: 0.7 / speed, delay: (0.15) / speed, times: [0, 0.35, 1], ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M4.21 3.26L2.55 2.14" />
        <path d="M3.8 4.6L1.8 4.6" />
        <path d="M4.21 5.94L2.55 7.06" />
      </motion.g>

      </g>
    </svg>
  );
}
