"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ParthenonIconProps = {
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

/** The pediment lifts and rocks while the columns stretch to hold it up, then it settles back with a small bump. */
export function ParthenonIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ParthenonIconProps) {
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
      <g transform="translate(0 -0.54)">

      <g stroke={accent}>
        <motion.path
          d="M6.6 18.4V9"
          style={{ originX: "50%", originY: "100%" }}
          initial={false}
          animate={on ? { scaleY: [1, 1.1, 1.17, 1.13, 1, 0.97, 1] } : { scaleY: 1 }}
          transition={{ duration: 1 / speed, times: [0, 0.18, 0.34, 0.5, 0.66, 0.8, 1], ease: "easeInOut" }}
        />
        <motion.path
          d="M10.2 18.4V9"
          style={{ originX: "50%", originY: "100%" }}
          initial={false}
          animate={on ? { scaleY: [1, 1.12, 1.17, 1.11, 1, 0.97, 1] } : { scaleY: 1 }}
          transition={{ duration: 1 / speed, times: [0, 0.18, 0.34, 0.5, 0.66, 0.8, 1], ease: "easeInOut" }}
        />
        <motion.path
          d="M13.8 18.4V9"
          style={{ originX: "50%", originY: "100%" }}
          initial={false}
          animate={on ? { scaleY: [1, 1.14, 1.17, 1.1, 1, 0.97, 1] } : { scaleY: 1 }}
          transition={{ duration: 1 / speed, times: [0, 0.18, 0.34, 0.5, 0.66, 0.8, 1], ease: "easeInOut" }}
        />
        <motion.path
          d="M17.4 18.4V9"
          style={{ originX: "50%", originY: "100%" }}
          initial={false}
          animate={on ? { scaleY: [1, 1.16, 1.17, 1.08, 1, 0.97, 1] } : { scaleY: 1 }}
          transition={{ duration: 1 / speed, times: [0, 0.18, 0.34, 0.5, 0.66, 0.8, 1], ease: "easeInOut" }}
        />
      </g>
      <motion.g
        style={{ originX: "50%", originY: "37.5%" }}
        initial={false}
        animate={on ? { y: [0, -1.2, -1.6, -1, 0, 0.3, 0], rotate: [0, -3, 0, 2.5, 0, 0, 0] } : { y: 0, rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.18, 0.34, 0.5, 0.66, 0.8, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3.6 9A0.6 0.6 0 0 1 3 8.4L3 8.18A0.6 0.6 0 0 1 3.35 7.64L11.62 3.78A0.9 0.9 0 0 1 12.38 3.78L20.65 7.64A0.6 0.6 0 0 1 21 8.18L21 8.4A0.6 0.6 0 0 1 20.4 9Z" />
      </motion.g>
      <path d="M4.6 18.4H19.4M3.0 21.4H21.0" />
      </g>
    </svg>
  );
}
