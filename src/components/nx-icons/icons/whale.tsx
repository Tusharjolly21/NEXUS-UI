"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WhaleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A whale that rises through the water, flips its tail and sends up a spout of spray. */
export function WhaleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WhaleIconProps) {
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
        initial={false}
        animate={on ? { y: [0, 0.7, -1.1, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.22, 0.6, 1], ease: "easeInOut" }}
      >
        <path d="M2.48 13.82C2.48 10.22 5.68 8.22 9.48 8.22C12.68 8.22 15.48 9.22 17.08 12.02C16.08 16.22 14.28 19.22 10.48 19.82C8.08 20.22 4.88 19.22 3.48 17.02C2.78 16.02 2.48 14.92 2.48 13.82Z" />
        <path d="M17.08 12.02Q18.68 10.02 18.29 7.62" />
        <motion.g
          style={{ originX: "76.17%", originY: "32.58%" }}
          initial={false}
          animate={on ? { rotate: [0, -14, 8, 0] } : { rotate: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.35, 0.65, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M18.22 8.62Q15.76 6.64 15.22 4.3Q16.79 4.81 18.41 5.92Q20.18 5.05 21.8 4.76Q20.94 7 18.22 8.62Z" fill="currentColor" strokeWidth={1} />
        </motion.g>
        <path d="M2.68 15.22Q5.88 17.22 9.28 15.32" strokeWidth={1.4} />
        <circle cx="5.58" cy="12.62" r="0.95" fill="currentColor" stroke="none" />
        <motion.path
          d="M7.48 7.62V4.22M7.48 4.22Q5.38 3.02 3.98 6.02M7.48 4.22Q9.58 3.02 10.98 6.02"
          stroke={accent}
          strokeWidth={strokeWidth * 0.75}
          initial={false}
          animate={on ? { pathLength: [1, 0, 1, 1], opacity: [1, 0.4, 1, 1] } : { pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.2, 0.7, 1], ease: "easeOut" }}
        />
      </motion.g>
    </svg>
  );
}
