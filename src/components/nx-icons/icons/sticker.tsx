"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type StickerIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff2d55. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The corner of the round sticker peels further back, then lets go and slaps flat with a little wobble. */
export function StickerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: StickerIconProps) {
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
      <g transform="translate(0.08 0.08)">

      <motion.path
        d="M20.46 10.47A8.6 8.6 0 0 0 10.47 20.46Z"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { d: ["M20.46 10.47A8.6 8.6 0 0 0 10.47 20.46Z", "M20.11 9.13A8.6 8.6 0 0 0 9.13 20.11Z", "M20.11 9.13A8.6 8.6 0 0 0 9.13 20.11Z", "M20.53 10.9A8.6 8.6 0 0 0 10.9 20.53Z", "M20.43 10.29A8.6 8.6 0 0 0 10.29 20.43Z", "M20.46 10.47A8.6 8.6 0 0 0 10.47 20.46Z"] } : { d: "M20.46 10.47A8.6 8.6 0 0 0 10.47 20.46Z" }}
        transition={{ duration: 0.9 / speed, times: [0, 0.36, 0.5, 0.74, 0.88, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M20.46 10.47A8.6 8.6 0 1 0 10.47 20.46Z"
        initial={false}
        animate={on ? { d: ["M20.46 10.47A8.6 8.6 0 1 0 10.47 20.46Z", "M20.11 9.13A8.6 8.6 0 1 0 9.13 20.11Z", "M20.11 9.13A8.6 8.6 0 1 0 9.13 20.11Z", "M20.53 10.9A8.6 8.6 0 1 0 10.9 20.53Z", "M20.43 10.29A8.6 8.6 0 1 0 10.29 20.43Z", "M20.46 10.47A8.6 8.6 0 1 0 10.47 20.46Z"] } : { d: "M20.46 10.47A8.6 8.6 0 1 0 10.47 20.46Z" }}
        transition={{ duration: 0.9 / speed, times: [0, 0.36, 0.5, 0.74, 0.88, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M20.46 10.47A8.6 8.6 0 0 0 10.47 20.46Z"
        initial={false}
        animate={on ? { d: ["M20.46 10.47A8.6 8.6 0 0 0 10.47 20.46Z", "M20.11 9.13A8.6 8.6 0 0 0 9.13 20.11Z", "M20.11 9.13A8.6 8.6 0 0 0 9.13 20.11Z", "M20.53 10.9A8.6 8.6 0 0 0 10.9 20.53Z", "M20.43 10.29A8.6 8.6 0 0 0 10.29 20.43Z", "M20.46 10.47A8.6 8.6 0 0 0 10.47 20.46Z"] } : { d: "M20.46 10.47A8.6 8.6 0 0 0 10.47 20.46Z" }}
        transition={{ duration: 0.9 / speed, times: [0, 0.36, 0.5, 0.74, 0.88, 1], ease: "easeInOut" }}
      />
      </g>
    </svg>
  );
}
