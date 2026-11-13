"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChairIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #f97316. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The office chair rolls forward on its wheels while the backrest reclines, then both return to rest. */
export function ChairIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ChairIconProps) {
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
      <g transform="translate(0.58 0.42)">

      <motion.g
        initial={false}
        animate={on ? { x: [0, 2.8, 2.8, 0] } : { x: 0 }}
        transition={{ duration: 0.95 / speed, times: [0, 0.4, 0.62, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="5.4" cy="20.1" r="1.3" fill={accent} stroke="none" />
        <circle cx="17.4" cy="20.1" r="1.3" fill={accent} stroke="none" />
        <motion.path
          d="M6 11.8V5.2A2.4 2.4 0 0 1 10.8 5.2V11.8"
          style={{ originX: "35%", originY: "49.17%" }}
          initial={false}
          animate={on ? { rotate: [0, -11, -11, 0] } : { rotate: 0 }}
          transition={{ duration: 0.95 / speed, times: [0, 0.4, 0.62, 1], ease: "easeInOut" }}
        />
        <rect x="3.6" y="11.8" width="15.6" height="3.8" rx="1.9" />
        <path d="M11.4 15.6V18.4M4.4 18.4H18.4" />
      </motion.g>

      </g>
    </svg>
  );
}
