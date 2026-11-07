"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MagicWandIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A wand that flicks back and forth while its star flares and a burst of sparkles scatters from the tip. */
export function MagicWandIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MagicWandIconProps) {
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
        style={{ originX: "26.63%", originY: "71.28%" }}
        initial={false}
        animate={on ? { rotate: [0, -17, 9, -4, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.22, 0.5, 0.75, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g transform="rotate(45 11.2 12.3)">
          <path d="M9.5 11.7H12.9" stroke={accent} />
          <rect x="9.5" y="8.5" width="3.4" height="12.8" rx="1.2" />
        </g>
        <motion.path
          d="M15.02 4.78L15.83 7.67L18.72 8.48L15.83 9.29L15.02 12.18L14.21 9.29L11.32 8.48L14.21 7.67z"
          fill={accent}
          stroke={accent}
          strokeWidth={1}
          style={{ originX: "62.58%", originY: "35.34%" }}
          initial={false}
          animate={on ? { scale: [1, 1.4, 0.9, 1] } : { scale: 1 }}
          transition={{ duration: 0.6 / speed, delay: (0.25) / speed, times: [0, 0.35, 0.7, 1] }}
        />
      </motion.g>
      <motion.path
        d="M18.27 5.23L19.19 4.31"
        stroke={accent}
        strokeWidth={1.6}
        initial={false}
        animate={on ? { x: [0, 1.56], y: [0, -1.56], opacity: [0, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0.3) / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M18.27 11.73L19.19 12.65"
        stroke={accent}
        strokeWidth={1.6}
        initial={false}
        animate={on ? { x: [0, 1.56], y: [0, 1.56], opacity: [0, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0.3) / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M11.77 11.73L10.85 12.65"
        stroke={accent}
        strokeWidth={1.6}
        initial={false}
        animate={on ? { x: [0, -1.56], y: [0, 1.56], opacity: [0, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0.3) / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M11.77 5.23L10.85 4.31"
        stroke={accent}
        strokeWidth={1.6}
        initial={false}
        animate={on ? { x: [0, -1.56], y: [0, -1.56], opacity: [0, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0.3) / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M6.2 4L6.62 5.48L8.1 5.9L6.62 6.32L6.2 7.8L5.78 6.32L4.3 5.9L5.78 5.48z"
        fill={accent}
        stroke={accent}
        strokeWidth={0.8}
        style={{ originX: "25.83%", originY: "24.58%" }}
        initial={false}
        animate={on ? { scale: [1, 0.2, 1.3, 1], rotate: [0, 0, 45, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.7 / speed, delay: (0.35) / speed, times: [0, 0.3, 0.7, 1] }}
      />
      <motion.path
        d="M18.8 13.8L19.19 15.11L20.5 15.5L19.19 15.89L18.8 17.2L18.41 15.89L17.1 15.5L18.41 15.11z"
        fill={accent}
        stroke={accent}
        strokeWidth={0.8}
        style={{ originX: "78.33%", originY: "64.58%" }}
        initial={false}
        animate={on ? { scale: [1, 0.2, 1.3, 1], rotate: [0, 0, 45, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.7 / speed, delay: (0.45) / speed, times: [0, 0.3, 0.7, 1] }}
      />
    </svg>
  );
}
