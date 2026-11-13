"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type StaplerIconProps = {
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

/** The stapler arm slams down onto the paper stack, squashes the staple and springs back open. */
export function StaplerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: StaplerIconProps) {
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
      <g transform="translate(0 -1.33)">

      <motion.g
        style={{ originX: "50%", originY: "81.25%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1, 0.3, 0.3, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.34, 0.45, 1], ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M16 19.5V16H20.4V19.5" stroke={accent} strokeWidth={strokeWidth * 0.75} />
      </motion.g>
      <path d="M3 19.5H21M4.5 19.5V15.5" />
      <motion.g
        style={{ originX: "18.75%", originY: "64.583%" }}
        initial={false}
        animate={on ? { rotate: [-14, 0, 0, -14] } : { rotate: -14 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.45, 1], ease: ["easeIn", "linear", "easeOut"] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M4.5 15.5V12.5A2 2 0 0 1 6.5 10.5H18.5A2.5 2.5 0 0 1 21 13V15.5Z" />
      </motion.g>
      </g>
    </svg>
  );
}
