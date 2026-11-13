"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChessPawnIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff9f0a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The pawn hops one square forward, lands with a squash and its head settles last. */
export function ChessPawnIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ChessPawnIconProps) {
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
      <g transform="translate(0 -1.39)">
      <motion.g
        initial={false}
        animate={on ? { y: [0, -2.6, 0, -0.8, 0], scaleY: [1, 1, 0.94, 1, 1] } : { y: 0, scaleY: 1 }}
        style={{ originX: "50%", originY: "21.2px" }}
        transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.55, 0.72, 1], ease: ["easeOut", "easeIn", "easeOut", "easeInOut"] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.g
          style={{ originX: "12px", originY: "11.6px" }}
          initial={false}
          animate={on ? { rotate: [0, 7, -6, 3, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.6, 0.8, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <circle cx="12" cy="8.6" r="3" stroke={accent} />
        </motion.g>
        <path d="M8.6 11.6H15.4" />
        <path d="M10.2 11.6C10.2 14.4 8.7 16.4 7.2 18.4H16.8C15.3 16.4 13.8 14.4 13.8 11.6" />
      </motion.g>
      <path d="M5 21.2H19" />
      </g>
    </svg>
  );
}
