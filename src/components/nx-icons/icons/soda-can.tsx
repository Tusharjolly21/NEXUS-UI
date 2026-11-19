"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SodaCanIconProps = {
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

/** A soda can gets a quick shake, its tab pops up with a hiss and fizzy bubbles rise from the top. */
export function SodaCanIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SodaCanIconProps) {
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
      <g transform="translate(0 -0.96)">

      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.circle
          cx="9.6" cy="5.4" r="0.78" fill="currentColor" stroke="none"
          initial={false}
          animate={on ? { y: [0, -3.6], x: [0, -0.7], opacity: [0, 1, 1, 0], scale: [0.4, 1, 1, 0.6] } : { y: 0, x: 0, opacity: 0, scale: 0.4 }}
          transition={{ y: { duration: 0.45 / speed, delay: (0.5) / speed, ease: "easeOut" }, x: { duration: 0.45 / speed, delay: (0.5) / speed, ease: "easeOut" }, opacity: { duration: 0.45 / speed, delay: (0.5) / speed, times: [0, 0.2, 0.7, 1], ease: "linear" }, scale: { duration: 0.45 / speed, delay: (0.5) / speed, times: [0, 0.2, 0.7, 1], ease: "linear" } }}
        />
        <motion.circle
          cx="14.4" cy="5.4" r="0.78" fill="currentColor" stroke="none"
          initial={false}
          animate={on ? { y: [0, -3.6], x: [0, 0.7], opacity: [0, 1, 1, 0], scale: [0.4, 1, 1, 0.6] } : { y: 0, x: 0, opacity: 0, scale: 0.4 }}
          transition={{ y: { duration: 0.45 / speed, delay: (0.57) / speed, ease: "easeOut" }, x: { duration: 0.45 / speed, delay: (0.57) / speed, ease: "easeOut" }, opacity: { duration: 0.45 / speed, delay: (0.57) / speed, times: [0, 0.2, 0.7, 1], ease: "linear" }, scale: { duration: 0.45 / speed, delay: (0.57) / speed, times: [0, 0.2, 0.7, 1], ease: "linear" } }}
        />
        <motion.circle
          cx="12" cy="5.4" r="0.78" fill="currentColor" stroke="none"
          initial={false}
          animate={on ? { y: [0, -3.6], x: [0, 0], opacity: [0, 1, 1, 0], scale: [0.4, 1, 1, 0.6] } : { y: 0, x: 0, opacity: 0, scale: 0.4 }}
          transition={{ y: { duration: 0.45 / speed, delay: (0.64) / speed, ease: "easeOut" }, x: { duration: 0.45 / speed, delay: (0.64) / speed, ease: "easeOut" }, opacity: { duration: 0.45 / speed, delay: (0.64) / speed, times: [0, 0.2, 0.7, 1], ease: "linear" }, scale: { duration: 0.45 / speed, delay: (0.64) / speed, times: [0, 0.2, 0.7, 1], ease: "linear" } }}
        />
      </svg>
      <motion.g
        style={{ originX: "50%", originY: "89.17%" }}
        initial={false}
        animate={on ? { rotate: [0, -5, 5, -4, 3, 0, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.08, 0.18, 0.28, 0.38, 0.46, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M6.6 12.6L6.87 12.72L7.14 12.83L7.41 12.94L7.68 13.04L7.95 13.13L8.22 13.21L8.49 13.27L8.76 13.31L9.03 13.34L9.3 13.35L9.57 13.34L9.84 13.31L10.11 13.27L10.38 13.21L10.65 13.13L10.92 13.04L11.19 12.94L11.46 12.83L11.73 12.72L12 12.6L12.27 12.48L12.54 12.37L12.81 12.26L13.08 12.16L13.35 12.07L13.62 11.99L13.89 11.93L14.16 11.89L14.43 11.86L14.7 11.85L14.97 11.86L15.24 11.89L15.51 11.93L15.78 11.99L16.05 12.07L16.32 12.16L16.59 12.26L16.86 12.37L17.13 12.48L17.4 12.6L17.4 15.9L17.13 15.78L16.86 15.67L16.59 15.56L16.32 15.46L16.05 15.37L15.78 15.29L15.51 15.23L15.24 15.19L14.97 15.16L14.7 15.15L14.43 15.16L14.16 15.19L13.89 15.23L13.62 15.29L13.35 15.37L13.08 15.46L12.81 15.56L12.54 15.67L12.27 15.78L12 15.9L11.73 16.02L11.46 16.13L11.19 16.24L10.92 16.34L10.65 16.43L10.38 16.51L10.11 16.57L9.84 16.61L9.57 16.64L9.3 16.65L9.03 16.64L8.76 16.61L8.49 16.57L8.22 16.51L7.95 16.43L7.68 16.34L7.41 16.24L7.14 16.13L6.87 16.02L6.6 15.9Z" fill={accent} stroke="none" />
        <path d="M8 8.02A1 1 0 0 1 8.82 7.6L15.18 7.6A1 1 0 0 1 16 8.02L17.22 9.74A1 1 0 0 1 17.4 10.32L17.4 18.68A1 1 0 0 1 17.22 19.26L16 20.98A1 1 0 0 1 15.18 21.4L8.82 21.4A1 1 0 0 1 8 20.98L6.78 19.26A1 1 0 0 1 6.6 18.68L6.6 10.32A1 1 0 0 1 6.78 9.74Z" />
        <path d="M6.65 10.01L17.35 10.01M6.65 18.99L17.35 18.99" strokeWidth={strokeWidth * 0.75} />
        <motion.g
          style={{ originX: "57.5%", originY: "31.67%" }}
          initial={false}
          animate={on ? { rotate: [0, 0, -38, -38, 0] } : { rotate: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.46, 0.52, 0.8, 1], ease: "easeOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M10.2 7.6V5.5A1 1 0 0 1 11.2 4.5H12.8A1 1 0 0 1 13.8 5.5V7.6" />
        </motion.g>
      </motion.g>

      </g>
    </svg>
  );
}
