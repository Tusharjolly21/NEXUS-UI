"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PhoneMissedIconProps = {
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

/** A handset that flashes red as the call arrow shoots up and left, then bounces back into place. */
export function PhoneMissedIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PhoneMissedIconProps) {
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
      <motion.g
        style={{ originX: "47%", originY: "56%" }}
        initial={false}
        animate={on ? { rotate: [0, -7, 6, -4, 2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6 / speed, delay: (on ? 0.1 : 0) / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M15.84 19.91C11.31 24.43 0.57 13.69 5.09 9.16L8.2 6.05L10.32 8.17L7.21 11.28C6.08 12.41 12.59 18.92 13.72 17.79L16.83 14.68L18.95 16.8L15.84 19.91Z"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { fillOpacity: [0, 0.55, 0.05, 0.4, 0] } : { fillOpacity: 0 }}
          transition={{ duration: 0.8 / speed }}
        />
        <path d="M15.84 19.91C11.31 24.43 0.57 13.69 5.09 9.16L8.2 6.05L10.32 8.17L7.21 11.28C6.08 12.41 12.59 18.92 13.72 17.79L16.83 14.68L18.95 16.8L15.84 19.91Z" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { x: [0, -3, 1, -0.4, 0], y: [0, -3, 1, -0.4, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.55, 0.78, 1], ease: "easeOut" }}
      >
        <path d="M20.4 10.6 14 4.2M14 8.8V4.2h4.6" stroke={accent} />
      </motion.g>
    </svg>
  );
}
