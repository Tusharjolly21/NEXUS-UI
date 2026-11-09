"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type StadiumIconProps = {
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

/** A stadium whose floodlights go dark and flash back on, one tower after the other, lighting up the pitch. */
export function StadiumIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: StadiumIconProps) {
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
      <path d="M2.8 9.66A9.2 4.2 0 0 1 21.2 9.66A9.2 4.2 0 0 1 2.8 9.66Z" />
      <path d="M2.8 9.66V16.26A9.2 4.2 0 0 0 21.2 16.26V9.66" />
      <path d="M3.94 18.29V17.04A1.66 1.66 0 0 1 7.26 17.04V19.86M10.1 20.37V18.46A1.9 1.9 0 0 1 13.9 18.46V20.37M16.74 19.86V17.04A1.66 1.66 0 0 1 20.06 17.04V18.29" strokeWidth={strokeWidth * 0.75} />
      <path d="M4.6 7.16V4.26" strokeWidth={strokeWidth * 0.75} />
      <path d="M19.4 7.16V4.26" strokeWidth={strokeWidth * 0.75} />
      <motion.ellipse
        cx="12"
        cy="9.66"
        rx="5.8"
        ry="1.5"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { opacity: [1, 0.12, 0.12, 1, 0.5, 1], scaleX: [1, 0.7, 0.7, 1.08, 1] } : { opacity: 1, scaleX: 1 }}
        transition={{ opacity: { duration: 1 / speed, times: [0, 0.12, 0.34, 0.5, 0.58, 0.7], ease: "easeOut" }, scaleX: { duration: 1 / speed, times: [0, 0.12, 0.34, 0.52, 0.7], ease: "easeOut" } }}
        style={{ originX: "50%", originY: "40.25%" }}
      />
      <motion.path
        d="M2.8 3.66H6.4"
        strokeWidth={strokeWidth * 1.1}
        initial={false}
        animate={on ? { opacity: [1, 0.15, 0.15, 1, 1, 0.4, 1, 1] } : { opacity: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.1, 0.22, 0.3, 0.7, 0.76, 0.82, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M17.6 3.66H21.2"
        strokeWidth={strokeWidth * 1.1}
        initial={false}
        animate={on ? { opacity: [1, 0.15, 0.15, 1, 1, 0.4, 1, 1] } : { opacity: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.3, 0.42, 0.5, 0.7, 0.76, 0.82, 1], ease: "easeOut" }}
      />
    </svg>
  );
}
