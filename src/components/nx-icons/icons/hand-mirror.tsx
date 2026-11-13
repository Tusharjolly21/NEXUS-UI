"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HandMirrorIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #38bdf8. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The mirror tilts side to side while a glint of light sweeps across the glass and returns. */
export function HandMirrorIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HandMirrorIconProps) {
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
      <g transform="translate(0 0.21)">

      <motion.g
        style={{ originX: "50%", originY: "87.5%" }}
        initial={false}
        animate={on ? { rotate: [0, -9, 7, -3.5, 0] } : { rotate: 0 }}
        transition={{ duration: 0.95 / speed, times: [0, 0.25, 0.55, 0.8, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.g
          style={{ originX: "50%", originY: "37.5%" }}
          initial={false}
          animate={on ? { rotate: [0, 120, 120, 0] } : { rotate: 0 }}
          transition={{ duration: 0.95 / speed, times: [0, 0.45, 0.6, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M8.81 7.84A3.4 3.4 0 0 1 10.95 5.77" stroke={accent} />
        </motion.g>
        <circle cx="12" cy="9" r="6.2" />
        <path d="M10 14.87V18.8A2 2 0 0 0 14 18.8V14.87" />
      </motion.g>

      </g>
    </svg>
  );
}
