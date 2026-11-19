"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PoundIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #34c759. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The pound sign hops up and lands with a heavy squash, its crossbar bouncing a beat behind. */
export function PoundIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PoundIconProps) {
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
      <g transform="translate(-0.08 0)">

      <motion.g
        style={{ originX: "50%", originY: "80.83%" }}
        initial={false}
        animate={on ? { y: [0, -2.4, 0, 0, 0], scaleY: [1, 1.04, 0.9, 1.03, 1], scaleX: [1, 0.97, 1.07, 0.99, 1] } : { y: 0, scaleY: 1, scaleX: 1 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.32, 0.56, 0.76, 1], ease: ["easeOut", "easeIn", "easeOut", "easeInOut"] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M6.75 13.6H13.35"
          stroke={accent}
          initial={false}
          animate={on ? { y: [0, 0.7, -0.5, 0.9, 0] } : { y: 0 }}
          transition={{ duration: 0.85 / speed, times: [0, 0.32, 0.56, 0.76, 1], ease: "easeInOut" }}
        />
        <path d="M16.92 6.54A3.65 3.65 0 0 0 10.05 8.25V19.4" />
        <path d="M6.5 19.4H17.6" />
      </motion.g>
      </g>
    </svg>
  );
}
