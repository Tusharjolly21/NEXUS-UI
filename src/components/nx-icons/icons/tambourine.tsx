"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TambourineIconProps = {
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

/** The tambourine shakes from side to side and its jingles rattle on the rim. */
export function TambourineIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TambourineIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, -15, 13, -10, 7, -3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.circle
          cx="15.79"
          cy="4.96"
          r="2"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { x: [0, -0.57, 0.57, -0.57, 0], y: [0, 0.57, -0.57, 0.57, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.9 / speed, delay: (0) / speed, ease: "easeInOut" }}
        />
        <motion.circle
          cx="19.04"
          cy="8.21"
          r="2"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { x: [0, 0.57, -0.57, 0.57, 0], y: [0, -0.57, 0.57, -0.57, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.9 / speed, delay: (0.03) / speed, ease: "easeInOut" }}
        />
        <motion.circle
          cx="19.04"
          cy="15.79"
          r="2"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { x: [0, -0.57, 0.57, -0.57, 0], y: [0, -0.57, 0.57, -0.57, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.9 / speed, delay: (0.06) / speed, ease: "easeInOut" }}
        />
        <motion.circle
          cx="15.79"
          cy="19.04"
          r="2"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { x: [0, 0.57, -0.57, 0.57, 0], y: [0, 0.57, -0.57, 0.57, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.9 / speed, delay: (0.09) / speed, ease: "easeInOut" }}
        />
        <motion.circle
          cx="8.21"
          cy="19.04"
          r="2"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { x: [0, 0.57, -0.57, 0.57, 0], y: [0, -0.57, 0.57, -0.57, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.9 / speed, delay: (0.12) / speed, ease: "easeInOut" }}
        />
        <motion.circle
          cx="4.96"
          cy="15.79"
          r="2"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { x: [0, -0.57, 0.57, -0.57, 0], y: [0, 0.57, -0.57, 0.57, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.9 / speed, delay: (0.15) / speed, ease: "easeInOut" }}
        />
        <motion.circle
          cx="4.96"
          cy="8.21"
          r="2"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { x: [0, 0.57, -0.57, 0.57, 0], y: [0, 0.57, -0.57, 0.57, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.9 / speed, delay: (0.18) / speed, ease: "easeInOut" }}
        />
        <motion.circle
          cx="8.21"
          cy="4.96"
          r="2"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { x: [0, -0.57, 0.57, -0.57, 0], y: [0, -0.57, 0.57, -0.57, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.9 / speed, delay: (0.21) / speed, ease: "easeInOut" }}
        />
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3.6" strokeWidth={strokeWidth * 0.75} />
      </motion.g>
    </svg>
  );
}
