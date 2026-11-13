"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LungsIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff6482. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Both lobes swell on an inhale and ease back on the exhale around the branching airways. */
export function LungsIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LungsIconProps) {
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
      <path d="M12 3.2L12 9.6" stroke={accent} />
      <path d="M12 9.6L9.2 12.4" stroke={accent} />
      <path d="M12 9.6L14.8 12.4" stroke={accent} />
      <motion.g style={{ originX: "38.33%", originY: "58.33%" }} initial={false} animate={on ? { scale: [1, 1.1, 1] } : { scale: 1 }} transition={{ duration: 0.9 / speed, times: [0, 0.55, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M9.2 12.4L6 15.6" stroke={accent} />
      <path d="M9.2 15.4L7 17.6" stroke={accent} />
      <path d="M9.2 8.6C7 8.8 3 13 2.9 17.8C2.8 20.4 4.6 21 6.6 20.8C8.6 20.6 9.2 19.4 9.2 17.6Z"  />
      </motion.g>
      <motion.g style={{ originX: "61.67%", originY: "58.33%" }} initial={false} animate={on ? { scale: [1, 1.1, 1] } : { scale: 1 }} transition={{ duration: 0.9 / speed, times: [0, 0.55, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M14.8 12.4L18 15.6" stroke={accent} />
      <path d="M14.8 15.4L17 17.6" stroke={accent} />
      <path d="M14.8 8.6C17 8.8 21 13 21.1 17.8C21.2 20.4 19.4 21 17.4 20.8C15.4 20.6 14.8 19.4 14.8 17.6Z"  />
      </motion.g>
    </svg>
  );
}
