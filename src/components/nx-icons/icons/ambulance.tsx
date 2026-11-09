"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AmbulanceIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff3b30. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An ambulance whose roof light flashes in turn from side to side while the van shudders and surges forward. */
export function AmbulanceIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AmbulanceIconProps) {
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
        animate={on ? { x: [0, -0.4, 1.4, 0] } : { x: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.18, 0.55, 1], ease: "easeInOut" }}
      >
        <motion.g
          initial={false}
          animate={on ? { y: [0, -0.35, 0, -0.35, 0, -0.35, 0, -0.35, 0] } : { y: 0 }}
          transition={{ duration: 0.9 / speed, ease: "linear" }}
        >
          <path d="M2.8 16.2V8.4a1.6 1.6 0 0 1 1.6-1.6H12.6a1.6 1.6 0 0 1 1.6 1.6V9.4H16.6L19.4 12.4H21.2V16.2Z" />
          <path d="M14.2 9.4V16.2M8.5 9.3V13.7M6.3 11.5H10.7" />
          <circle cx="7.4" cy="18.2" r="2" />
          <circle cx="16.6" cy="18.2" r="2" />
          <motion.path
            d="M9.2 4.3H12"
            stroke={accent}
            strokeWidth={3}
            initial={false}
            animate={on ? { opacity: [1, 0.25, 1, 0.25, 1, 0.25, 1, 0.25, 1] } : { opacity: 1 }}
            transition={{ duration: 0.9 / speed, ease: "linear" }}
          />
          <motion.path
            d="M6.6 2.7L5.4 1.9M6 4.7H4.6"
            stroke={accent}
            strokeWidth={strokeWidth * 0.7}
            initial={false}
            animate={on ? { opacity: [0, 0, 1, 0, 0, 0, 1, 0, 0] } : { opacity: 0 }}
            transition={{ duration: 0.9 / speed, ease: "linear" }}
          />
          <motion.path
            d="M14.6 2.7L15.8 1.9M15.2 4.7H16.6"
            stroke={accent}
            strokeWidth={strokeWidth * 0.7}
            initial={false}
            animate={on ? { opacity: [0, 0, 0, 0, 1, 0, 0, 0, 0] } : { opacity: 0 }}
            transition={{ duration: 0.9 / speed, ease: "linear" }}
          />
        </motion.g>
      </motion.g>
    </svg>
  );
}
