"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ClothesIronIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ef4444. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The iron glides forward and back along the board as its three steam vents swell one after another. */
export function ClothesIronIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ClothesIronIconProps) {
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
      <g transform="translate(0 -1)">

      <path d="M3 21.4H21" />
      <motion.g
        initial={false}
        animate={on ? { x: [0, 1.8, -2, 0], y: [0, 0.4, 0, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.4, 0.75, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M4 16.89A1.4 1.4 0 0 0 5.36 18.6L18.15 18.6A1.4 1.4 0 0 0 19.35 16.49L16.64 11.88A2.2 2.2 0 0 0 14.74 10.8L6.35 10.8A1.2 1.2 0 0 0 5.19 11.73Z" />
        <path d="M8 10.8V7A2.4 2.4 0 0 1 10.4 4.6H11.2A2.4 2.4 0 0 1 13.6 7V10.8" />
          <motion.path
            d="M8.4 15.4h0.01"
            stroke={accent}
            style={{ originX: "35%", originY: "64.17%" }}
            initial={false}
            animate={on ? { scale: [1, 1.9, 1] } : { scale: 1 }}
            transition={{ duration: 0.4 / speed, delay: (0.1) / speed, ease: "easeInOut" }}
          />
          <motion.path
            d="M11.4 15.4h0.01"
            stroke={accent}
            style={{ originX: "47.5%", originY: "64.17%" }}
            initial={false}
            animate={on ? { scale: [1, 1.9, 1] } : { scale: 1 }}
            transition={{ duration: 0.4 / speed, delay: (0.25) / speed, ease: "easeInOut" }}
          />
          <motion.path
            d="M14.4 15.4h0.01"
            stroke={accent}
            style={{ originX: "60%", originY: "64.17%" }}
            initial={false}
            animate={on ? { scale: [1, 1.9, 1] } : { scale: 1 }}
            transition={{ duration: 0.4 / speed, delay: (0.4) / speed, ease: "easeInOut" }}
          />
      </motion.g>

      </g>
    </svg>
  );
}
