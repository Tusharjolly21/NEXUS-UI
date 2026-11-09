"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ShovelIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ac8e68. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A spade that dips into the ground, lifts a little scoop and flicks the soil away. */
export function ShovelIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ShovelIconProps) {
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
        style={{ originX: "72.65%", originY: "27.35%" }}
        initial={false}
        animate={on ? { x: [0, -1.5, -1.5, 0.7, 0], y: [0, 1.5, 1.5, -0.7, 0], rotate: [0, 0, 0, 7, 0] } : { x: 0, y: 0, rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.3, 0.42, 0.7, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g transform="translate(-0.15 0.15) rotate(45 12 12)">
          <rect x="8.4" y="2" width="7.2" height="4.2" rx="2.1" />
          <path d="M12 6.2 V12.4" />
          <path d="M7.4 12.4 H16.6 V15.8 C16.6 19.3 14.4 22.2 12 23.4 C9.6 22.2 7.4 19.3 7.4 15.8 Z" stroke={accent} />
          
          <motion.circle
            cx="12"
            cy="15.8"
            r="1"
            fill={accent}
            stroke="none"
            style={{ originX: "50%", originY: "50%" }}
            initial={false}
            animate={on ? { scale: [0, 1, 1, 1], x: [0, 0, 0, 5.4], y: [0, 0, 0, -3.6], opacity: [0, 1, 1, 0] } : { scale: 0, x: 0, y: 0, opacity: 0 }}
            transition={{ duration: 0.72 / speed, delay: (0.28) / speed, times: [0, 0.14, 0.38, 1], ease: "easeInOut" }}
          />
          <motion.circle
            cx="10.2"
            cy="18.1"
            r="1"
            fill={accent}
            stroke="none"
            style={{ originX: "50%", originY: "50%" }}
            initial={false}
            animate={on ? { scale: [0, 1, 1, 1], x: [0, 0, 0, 6], y: [0, 0, 0, -2.6], opacity: [0, 1, 1, 0] } : { scale: 0, x: 0, y: 0, opacity: 0 }}
            transition={{ duration: 0.72 / speed, delay: (0.31) / speed, times: [0, 0.14, 0.38, 1], ease: "easeInOut" }}
          />
          <motion.circle
            cx="13.8"
            cy="18.1"
            r="1"
            fill={accent}
            stroke="none"
            style={{ originX: "50%", originY: "50%" }}
            initial={false}
            animate={on ? { scale: [0, 1, 1, 1], x: [0, 0, 0, 6.6], y: [0, 0, 0, -1.6], opacity: [0, 1, 1, 0] } : { scale: 0, x: 0, y: 0, opacity: 0 }}
            transition={{ duration: 0.72 / speed, delay: (0.34) / speed, times: [0, 0.14, 0.38, 1], ease: "easeInOut" }}
          />
        </g>
      </motion.g>
    </svg>
  );
}
