"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ElephantIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #64d2ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The elephant flaps its big ears and swings its trunk from side to side. */
export function ElephantIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ElephantIconProps) {
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
      <g transform="translate(0 -0.62)">

      <motion.g
        style={{ originX: "30.92%", originY: "41.67%" }}
        initial={false}
        animate={on ? { scaleX: [1, 0.7, 1, 0.8, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.22, 0.46, 0.7, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M7.42 6.94C4.4 2.4 1.8 6.0 3.0 11.2C3.8 13.8 5.6 14.6 7.07 12A5.4 5.4 0 0 1 7.42 6.94Z" fill={accent} stroke="none" />
        <path d="M7.42 6.94C4.4 2.4 1.8 6.0 3.0 11.2C3.8 13.8 5.6 14.6 7.07 12" />
      </motion.g>
      <motion.g
        style={{ originX: "69.08%", originY: "41.67%" }}
        initial={false}
        animate={on ? { scaleX: [1, 0.7, 1, 0.8, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.22, 0.46, 0.7, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M16.58 6.94C19.6 2.4 22.2 6.0 21 11.2C20.2 13.8 18.4 14.6 16.93 12A5.4 5.4 0 0 0 16.58 6.94Z" fill={accent} stroke="none" />
        <path d="M16.58 6.94C19.6 2.4 22.2 6.0 21 11.2C20.2 13.8 18.4 14.6 16.93 12" />
      </motion.g>
      <motion.path
        d="M16.68 12.5C15.83 13.97 13.5 14 13.5 15.6C13.5 17 13.5 18 13.5 19.4A1.5 1.5 0 0 1 10.5 19.4C10.5 18 10.5 17 10.5 15.6C10.5 14 8.17 13.97 7.32 12.5A5.4 5.4 0 1 1 16.68 12.5Z"
        initial={false}
        animate={on ? { d: ["M16.68 12.5C15.83 13.97 13.5 14 13.5 15.6C13.5 17 13.5 18 13.5 19.4A1.5 1.5 0 0 1 10.5 19.4C10.5 18 10.5 17 10.5 15.6C10.5 14 8.17 13.97 7.32 12.5A5.4 5.4 0 1 1 16.68 12.5Z", "M16.68 12.5C15.83 13.97 13.5 14 13.5 15.6C13.5 17 11.5 18 11.5 19.4A1.5 1.5 0 0 1 8.5 19.4C8.5 18 10.5 17 10.5 15.6C10.5 14 8.17 13.97 7.32 12.5A5.4 5.4 0 1 1 16.68 12.5Z", "M16.68 12.5C15.83 13.97 13.5 14 13.5 15.6C13.5 17 15.5 18 15.5 19.4A1.5 1.5 0 0 1 12.5 19.4C12.5 18 10.5 17 10.5 15.6C10.5 14 8.17 13.97 7.32 12.5A5.4 5.4 0 1 1 16.68 12.5Z", "M16.68 12.5C15.83 13.97 13.5 14 13.5 15.6C13.5 17 11.5 18 11.5 19.4A1.5 1.5 0 0 1 8.5 19.4C8.5 18 10.5 17 10.5 15.6C10.5 14 8.17 13.97 7.32 12.5A5.4 5.4 0 1 1 16.68 12.5Z", "M16.68 12.5C15.83 13.97 13.5 14 13.5 15.6C13.5 17 13.5 18 13.5 19.4A1.5 1.5 0 0 1 10.5 19.4C10.5 18 10.5 17 10.5 15.6C10.5 14 8.17 13.97 7.32 12.5A5.4 5.4 0 1 1 16.68 12.5Z"] } : { d: "M16.68 12.5C15.83 13.97 13.5 14 13.5 15.6C13.5 17 13.5 18 13.5 19.4A1.5 1.5 0 0 1 10.5 19.4C10.5 18 10.5 17 10.5 15.6C10.5 14 8.17 13.97 7.32 12.5A5.4 5.4 0 1 1 16.68 12.5Z" }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      />
      <circle cx="10" cy="10.2" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="10.2" r="1.1" fill="currentColor" stroke="none" />

      </g>
    </svg>
  );
}
