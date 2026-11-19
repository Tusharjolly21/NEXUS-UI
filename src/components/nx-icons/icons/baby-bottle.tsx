"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BabyBottleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5ac8fa. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The bottle tips forward to feed and rocks while the milk inside stays level, then it stands back up. */
export function BabyBottleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BabyBottleIconProps) {
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
      <g transform="translate(0 -0.2)">

      <motion.g
        style={{ originX: "50%", originY: "61.67%" }}
        initial={false}
        animate={on ? { rotate: [0, -28, -22, -28, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.3, 0.5, 0.7, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M9 14.8V19A2 2 0 0 0 11 21H13A2 2 0 0 0 15 19V14.8Z"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { d: ["M9 14.8V19A2 2 0 0 0 11 21H13A2 2 0 0 0 15 19V14.8Z", "M9 13.2V19A2 2 0 0 0 11 21H13A2 2 0 0 0 15 19V16.4Z", "M9 13.59V19A2 2 0 0 0 11 21H13A2 2 0 0 0 15 19V16.01Z", "M9 13.2V19A2 2 0 0 0 11 21H13A2 2 0 0 0 15 19V16.4Z", "M9 14.8V19A2 2 0 0 0 11 21H13A2 2 0 0 0 15 19V14.8Z"] } : { d: "M9 14.8V19A2 2 0 0 0 11 21H13A2 2 0 0 0 15 19V14.8Z" }}
          transition={{ duration: 1 / speed, times: [0, 0.3, 0.5, 0.7, 1], ease: "easeInOut" }}
        />
        <path d="M9.9 7.2C9.9 4.6 11 3.4 12 3.4C13 3.4 14.1 4.6 14.1 7.2" />
        <path d="M8.2 7.9A0.7 0.7 0 0 1 8.9 7.2L15.1 7.2A0.7 0.7 0 0 1 15.8 7.9L15.8 9.5A0.7 0.7 0 0 1 15.1 10.2L8.9 10.2A0.7 0.7 0 0 1 8.2 9.5Z" />
        <path d="M9 10.2V19A2 2 0 0 0 11 21H13A2 2 0 0 0 15 19V10.2" />
        <path d="M15 13H13.2M15 15.4H13.8M15 17.8H13.2" strokeWidth={strokeWidth * 0.75} />
      </motion.g>
      </g>
    </svg>
  );
}
