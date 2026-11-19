"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SnowmanIconProps = {
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

/** The snowman raises a stick arm and tips his hat up off his head with a little tilt, then sets it back down. */
export function SnowmanIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SnowmanIconProps) {
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
      <g transform="translate(0 -0.38)">

      <motion.g
        style={{ originX: "68.13%", originY: "60.71%" }}
        initial={false}
        animate={on ? { rotate: [0, -28, -28, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.3, 0.62, 0.9], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M16.35 14.57L19.75 12.17" />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "28.96%" }}
        initial={false}
        animate={on ? { y: [0, -1.5, -1.5, 0.25, 0], rotate: [0, 8, 8, 0, 0] } : { y: 0, rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.3, 0.62, 0.86, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g fill={accent} stroke="none"><rect x="9.8" y="5.05" width="4.4" height="1.9" /></g>
        <path d="M9.8 6.95L9.8 4.05A0.7 0.7 0 0 1 10.5 3.35L13.5 3.35A0.7 0.7 0 0 1 14.2 4.05L14.2 6.95" />
        <path d="M8.4 6.95H15.6" />
      </motion.g>
      <motion.path
        d="M9.98 6.95A3.1 3.1 0 0 1 14.02 6.95"
        initial={false}
        animate={on ? { opacity: [0, 1, 1, 0, 0] } : { opacity: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.18, 0.66, 0.8, 1], ease: "linear" }}
      />
      <path d="M9.98 6.95A3.1 3.1 0 1 0 14.02 6.95" />
      <path d="M10.53 12.03A4.8 4.8 0 1 0 13.47 12.03" />
      <path d="M7.65 14.57L4.25 12.17" />
      <g fill="currentColor" stroke="none"><circle cx="10.75" cy="9.1" r="0.75" /><circle cx="13.25" cy="9.1" r="0.75" /><circle cx="12" cy="15.1" r="0.8" /><circle cx="12" cy="18.1" r="0.8" /></g>
      </g>
    </svg>
  );
}
