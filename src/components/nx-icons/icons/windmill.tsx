"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WindmillIconProps = {
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

/** A windmill whose sails wind back a touch, then sweep a quarter turn and settle. */
export function WindmillIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WindmillIconProps) {
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
      <path d="M11 10.84L9.4 20.49H14.6L13 10.84" />
      <motion.g
        style={{ originX: "50%", originY: "45.17%" }}
        initial={false}
        animate={on ? { rotate: [0, -8, 95, 90] } : { rotate: 0 }}
        transition={on ? { duration: 0.95 / speed, times: [0, 0.16, 0.85, 1], ease: "easeInOut" } : { duration: 0 / speed }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g transform="translate(12 10.84) rotate(45)">
          <path d="M0 0H6.8" stroke={accent} strokeWidth={strokeWidth * 0.5} />
          <path d="M6.8 -1.1H10V1.1H6.8Z" fill={accent} stroke={accent} strokeWidth={strokeWidth * 0.5} />
        </g>
        <g transform="translate(12 10.84) rotate(135)">
          <path d="M0 0H6.8" stroke={accent} strokeWidth={strokeWidth * 0.5} />
          <path d="M6.8 -1.1H10V1.1H6.8Z" fill={accent} stroke={accent} strokeWidth={strokeWidth * 0.5} />
        </g>
        <g transform="translate(12 10.84) rotate(225)">
          <path d="M0 0H6.8" stroke={accent} strokeWidth={strokeWidth * 0.5} />
          <path d="M6.8 -1.1H10V1.1H6.8Z" fill={accent} stroke={accent} strokeWidth={strokeWidth * 0.5} />
        </g>
        <g transform="translate(12 10.84) rotate(315)">
          <path d="M0 0H6.8" stroke={accent} strokeWidth={strokeWidth * 0.5} />
          <path d="M6.8 -1.1H10V1.1H6.8Z" fill={accent} stroke={accent} strokeWidth={strokeWidth * 0.5} />
        </g>
      </motion.g>
      <circle cx="12" cy="10.84" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}
