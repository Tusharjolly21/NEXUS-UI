"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BucketIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #2f9bff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The bucket swings from its handle and settles while the water inside slops from side to side. */
export function BucketIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BucketIconProps) {
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
      <g transform="translate(0 0.38)">

      <motion.g
        style={{ originX: "50%", originY: "10.83%" }}
        initial={false}
        animate={on ? { rotate: [0, -8, 7, -4.5, 2, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.2, 0.45, 0.68, 0.86, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M8.27 13.4Q10.13 11 12 13.4T15.73 13.4"
          stroke={accent}
          initial={false}
          animate={on ? { d: ["M8.27 13.4Q10.13 11 12 13.4T15.73 13.4", "M8.27 13.4Q10.13 15.8 12 13.4T15.73 13.4", "M8.27 13.4Q10.13 11 12 13.4T15.73 13.4", "M8.27 13.4Q10.13 15.8 12 13.4T15.73 13.4", "M8.27 13.4Q10.13 11 12 13.4T15.73 13.4", "M8.27 13.4Q10.13 11 12 13.4T15.73 13.4"] } : { d: "M8.27 13.4Q10.13 11 12 13.4T15.73 13.4" }}
          transition={{ duration: 1 / speed, times: [0, 0.2, 0.45, 0.68, 0.86, 1], ease: "easeInOut" }}
        />
        <path d="M4.2 8.2L19.8 8.2L17.68 19.14A1.8 1.8 0 0 1 15.91 20.6L8.09 20.6A1.8 1.8 0 0 1 6.32 19.14Z" />
        <path d="M4.2 8.2A7.8 5.6 0 0 1 19.8 8.2" />
      </motion.g>

      </g>
    </svg>
  );
}
