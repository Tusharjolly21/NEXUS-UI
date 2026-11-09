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

/** A stadium whose floodlights go dark, then flash on one tower after the other. */
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
      <rect x="2.5" y="10" width="19" height="11" rx="5.5" />
      <rect x="5.5" y="13" width="13" height="5" rx="2.5" />
      <path d="M5.5 10.6V4.6" />
      <motion.g
        style={{ originX: "22.92%", originY: "12.5%" }}
        initial={false}
        animate={on ? { opacity: [1, 0.15, 0.15, 1, 1, 0.4, 1, 1], scaleY: [1, 1, 1.7, 1, 1] } : { opacity: 1, scaleY: 1 }}
        transition={{ opacity: { duration: 1 / speed, times: [0, 0.1, 0.22, 0.3, 0.7, 0.76, 0.82, 1], ease: "easeOut" }, scaleY: { duration: 1 / speed, times: [0, 0.22, 0.3, 0.5, 1], ease: "easeOut" } }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M2.5 3H8.5" stroke={accent} />
      </motion.g>
      <path d="M18.5 10.6V4.6" />
      <motion.g
        style={{ originX: "77.08%", originY: "12.5%" }}
        initial={false}
        animate={on ? { opacity: [1, 0.15, 0.15, 1, 1, 0.4, 1, 1], scaleY: [1, 1, 1.7, 1, 1] } : { opacity: 1, scaleY: 1 }}
        transition={{ opacity: { duration: 1 / speed, times: [0, 0.1, 0.47, 0.55, 0.7, 0.76, 0.82, 1], ease: "easeOut" }, scaleY: { duration: 1 / speed, times: [0, 0.47, 0.55, 0.75, 1], ease: "easeOut" } }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M15.5 3H21.5" stroke={accent} />
      </motion.g>
    </svg>
  );
}
