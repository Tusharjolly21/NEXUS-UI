"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type XylophoneIconProps = {
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

/** Two mallets tap the bars in turn and the keys ring. */
export function XylophoneIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: XylophoneIconProps) {
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
      <g transform="translate(0 0.2)">
      <motion.g
        style={{ originX: "3.6px", originY: "2.6px" }}
        initial={false}
        animate={on ? { rotate: [0, -12, 0, -12, 0, -3, 0, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.1, 0.2, 0.38, 0.5, 0.58, 0.75, 1], ease: ["easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeInOut", "linear"] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3.6 2.6L9 8.5" stroke={accent} />
        <circle cx="9" cy="8.5" r="2" fill={accent} stroke="none" />
      </motion.g>
      <motion.g
        style={{ originX: "20.4px", originY: "2.6px" }}
        initial={false}
        animate={on ? { rotate: [0, 0, 12, 0, 12, 0, 3, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.12, 0.25, 0.35, 0.55, 0.65, 0.73, 0.9], ease: ["linear", "easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeInOut"] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M20.4 2.6L15 8.5" stroke={accent} />
        <circle cx="15" cy="8.5" r="2" fill={accent} stroke="none" />
      </motion.g>
      <path d="M7.7 10.5H16.3L19.5 21H4.5z" />
      <path d="M6.63 14H17.37" />
      <path d="M5.57 17.5H18.43" />
      </g>
    </svg>
  );
}
