"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HospitalIconProps = {
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

/** A hospital whose red cross beats like a pulse while its windows switch on one after another. */
export function HospitalIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HospitalIconProps) {
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
      <rect x="3" y="3" width="18" height="18" rx="1.6" />
      <path d="M10 21v-5h4v5" />
      <motion.g
        style={{ originX: "50%", originY: "41.67%" }}
        initial={false}
        animate={on ? { scale: [1, 1.32, 1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.2, 0.42, 0.62, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 7.5v5M9.5 10h5" stroke={accent} />
      </motion.g>
      <motion.path
        d="M6.25 10h.01"
        strokeWidth={2.4}
        initial={false}
        animate={on ? { opacity: [1, 0.15, 0.15, 1] } : { opacity: 1 }}
        transition={{ duration: 0.4 / speed, times: [0, 0.2, 0.7, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M17.75 10h.01"
        strokeWidth={2.4}
        initial={false}
        animate={on ? { opacity: [1, 0.15, 0.15, 1] } : { opacity: 1 }}
        transition={{ duration: 0.52 / speed, times: [0, 0.15, 0.77, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M6.25 17.5h.01"
        strokeWidth={2.4}
        initial={false}
        animate={on ? { opacity: [1, 0.15, 0.15, 1] } : { opacity: 1 }}
        transition={{ duration: 0.64 / speed, times: [0, 0.12, 0.81, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M17.75 17.5h.01"
        strokeWidth={2.4}
        initial={false}
        animate={on ? { opacity: [1, 0.15, 0.15, 1] } : { opacity: 1 }}
        transition={{ duration: 0.76 / speed, times: [0, 0.11, 0.84, 1], ease: "easeOut" }}
      />
    </svg>
  );
}
