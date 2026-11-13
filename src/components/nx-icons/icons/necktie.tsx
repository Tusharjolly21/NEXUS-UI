"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type NecktieIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #6366f1. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The tie swings like a pendulum from its knot, its diagonal stripes swaying with it, and hangs still again. */
export function NecktieIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: NecktieIconProps) {
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
        style={{ originX: "50%", originY: "31.67%" }}
        initial={false}
        animate={on ? { rotate: [0, 12, -10, 6.5, -3, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.2, 0.44, 0.66, 0.84, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g stroke={accent}>
          <path d="M9.14 12.4L14.23 10" />
          <path d="M8.24 15.8L15.13 13.4" />
        </g>
        <path d="M10.4 7.6L13.6 7.6L16.31 17.88A1.4 1.4 0 0 1 15.56 19.5L12.6 20.91A1.4 1.4 0 0 1 11.4 20.91L8.44 19.5A1.4 1.4 0 0 1 7.69 17.88Z" />
      </motion.g>
      <path d="M9.53 4.25A1 1 0 0 1 10.49 3L13.51 3A1 1 0 0 1 14.47 4.25L13.76 7A0.8 0.8 0 0 1 12.98 7.6L11.02 7.6A0.8 0.8 0 0 1 10.24 7Z" />
    </svg>
  );
}
