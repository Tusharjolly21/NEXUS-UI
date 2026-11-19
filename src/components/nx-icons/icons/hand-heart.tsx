"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HandHeartIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The open palm lifts the heart resting above it while the heart beats twice, then both settle back. */
export function HandHeartIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HandHeartIconProps) {
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
      <g transform="translate(2.06 -0.1)">

      <motion.g
        initial={false}
        animate={on ? { y: [0, -1.6, -1.6, -1.6, 0] } : { y: 0 }}
        transition={{ duration: 0.95 / speed, times: [0, 0.22, 0.5, 0.75, 1], ease: "easeInOut" }}
      >
        <motion.path
          d="M12 7.06L10.16 5.22A1.3 1.3 0 0 1 12 3.38A1.3 1.3 0 0 1 13.84 5.22Z"
          fill={accent}
          stroke={accent}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1, 1.2, 1, 1.15, 1] } : { scale: 1 }}
          transition={{ duration: 0.95 / speed, times: [0, 0.22, 0.36, 0.5, 0.64, 1], ease: "easeInOut" }}
        />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { y: [0, -0.8, -0.8, -0.8, 0] } : { y: 0 }}
        transition={{ duration: 0.95 / speed, times: [0, 0.22, 0.5, 0.75, 1], ease: "easeInOut" }}
      >
        <path d="M9.2 18.4L7.03 17.24A1.2 1.2 0 0 1 6.4 16.18L6.4 16.08A0.5 0.5 0 0 0 6.25 15.73L2.72 12.2A1.4 1.4 0 0 1 4.7 10.22L4.7 10.22L5.89 11.4A0.3 0.3 0 0 0 6.4 11.19L6.4 11.02A1.4 1.4 0 0 1 9.2 11.02A1.4 1.4 0 0 1 12 11.02A1.4 1.4 0 0 1 14.8 11.02A1.4 1.4 0 0 1 17.6 11.02L17.6 11.02L17.6 16.18A1.2 1.2 0 0 1 16.97 17.24L14.8 18.4" />
        <path d="M8.4 19A0.6 0.6 0 0 1 9 18.4L15 18.4A0.6 0.6 0 0 1 15.6 19L15.6 20.6A0.6 0.6 0 0 1 15 21.2L9 21.2A0.6 0.6 0 0 1 8.4 20.6Z" />
      </motion.g>
      </g>
    </svg>
  );
}
