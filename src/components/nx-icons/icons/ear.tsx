"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type EarIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An ear that leans toward the sound while two sound waves travel in and settle beside it. */
export function EarIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: EarIconProps) {
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
      <g transform="translate(0.21 0.33)">
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { x: [0, -1.4, -1.4, 0], opacity: [1, 0, 0, 1] } : { x: 0, opacity: 1 }} transition={{ duration: 0.7 / speed, times: [0, 0.16, 0.24, 0.7], ease: "easeOut", delay: (0.2) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M3.69 8.03A12.2 12.2 0 0 0 3.69 17.17" stroke={accent} />
      </motion.g>
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { x: [0, -1.4, -1.4, 0], opacity: [1, 0, 0, 1] } : { x: 0, opacity: 1 }} transition={{ duration: 0.7 / speed, times: [0, 0.16, 0.24, 0.7], ease: "easeOut", delay: (0.05) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M6.28 9.08A9.4 9.4 0 0 0 6.28 16.12" stroke={accent} />
      </motion.g>
      <motion.g style={{ originX: "62.5%", originY: "75.83%" }} initial={false} animate={on ? { rotate: [0, -5, -5, 0] } : { rotate: 0 }} transition={{ duration: 0.9 / speed, times: [0, 0.25, 0.6, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M9.2 10.4L9.2 9.2A5.8 5.8 0 0 1 20.8 9.2C20.8 13.2 16 14.2 15.4 17A3 3 0 0 1 9.6 18"  />
      <path d="M12.4 12.8L12.4 9.2A2.6 2.6 0 0 1 17.6 9.2L17.6 10.4"  />
      </motion.g>
      </g>
    </svg>
  );
}
