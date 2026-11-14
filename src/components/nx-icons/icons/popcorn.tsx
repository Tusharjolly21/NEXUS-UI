"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PopcornIconProps = {
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

/** A popcorn bucket whose fluffy heap puffs up twice while two kernels pop out, hop and drop back in. */
export function PopcornIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PopcornIconProps) {
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
      <g fill={accent} stroke="none"><path d="M5.633 12.1 L8.18 12.1 L9.62 21.3 L8.033 21.3Z" /><path d="M10.727 12.1 L13.273 12.1 L12.793 21.3 L11.207 21.3Z" /><path d="M15.82 12.1 L18.367 12.1 L15.967 21.3 L14.38 21.3Z" /></g>
      <path d="M4.6 12.1 L19.4 12.1 L17.273 20.253 A1.4 1.4 0 0 1 15.918 21.3 L8.082 21.3 A1.4 1.4 0 0 1 6.727 20.253 Z" />
      <motion.g
        style={{ originX: "50%", originY: "50.417%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.09, 0.99, 1.1, 0.99, 0.97, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.95 / speed, delay: (0.1) / speed, times: [0, 0.105, 0.232, 0.379, 0.526, 0.653, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M4.6 12.1 A3.14 3.14 0 0 1 5.526 6.615 A2.9 2.9 0 0 1 9.316 4.249 A3.1 3.1 0 0 1 14.684 4.249 A2.9 2.9 0 0 1 18.474 6.615 A3.14 3.14 0 0 1 19.4 12.1" />
      </motion.g>
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.circle
          cx="5.526" cy="5.715" r="1.15" fill="currentColor" stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { y: [0, -4.2, 0], opacity: [0, 1, 1, 0], scale: [0.4, 1, 1, 0.4] } : { y: 0, opacity: 0, scale: 0.4 }}
          transition={{ y: { duration: 0.6 / speed, delay: (0.1) / speed, times: [0, 0.5, 1], ease: ["easeOut", "easeIn"] }, opacity: { duration: 0.6 / speed, delay: (0.1) / speed, times: [0, 0.08, 0.85, 1], ease: "linear" }, scale: { duration: 0.6 / speed, delay: (0.1) / speed, times: [0, 0.08, 0.85, 1], ease: "linear" } }}
        />
        <motion.circle
          cx="18.474" cy="5.715" r="1.15" fill="currentColor" stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { y: [0, -4.2, 0], opacity: [0, 1, 1, 0], scale: [0.4, 1, 1, 0.4] } : { y: 0, opacity: 0, scale: 0.4 }}
          transition={{ y: { duration: 0.6 / speed, delay: (0.37) / speed, times: [0, 0.5, 1], ease: ["easeOut", "easeIn"] }, opacity: { duration: 0.6 / speed, delay: (0.37) / speed, times: [0, 0.08, 0.85, 1], ease: "linear" }, scale: { duration: 0.6 / speed, delay: (0.37) / speed, times: [0, 0.08, 0.85, 1], ease: "linear" } }}
        />
      </svg>
    </svg>
  );
}
