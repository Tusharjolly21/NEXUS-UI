"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PretzelIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #9aaec8. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A pretzel gives a little hop and a pinch of salt crystals tumbles down onto it. */
export function PretzelIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PretzelIconProps) {
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
      <g transform="translate(0 -0.5)">

      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.rect
          x="6.8" y="-2.6" width="1.6" height="1.6" rx="0.3" fill={accent} stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { y: [0, 11.4], rotate: [45, 225], opacity: [0, 1, 1, 0] } : { y: 0, rotate: 45, opacity: 0 }}
          transition={{ y: { duration: 0.55 / speed, delay: (0.18) / speed, ease: "easeIn" }, rotate: { duration: 0.55 / speed, delay: (0.18) / speed, ease: "linear" }, opacity: { duration: 0.55 / speed, delay: (0.18) / speed, times: [0, 0.15, 0.75, 1], ease: "linear" } }}
        />
        <motion.rect
          x="11.2" y="-2.6" width="1.6" height="1.6" rx="0.3" fill={accent} stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { y: [0, 16.8], rotate: [45, 225], opacity: [0, 1, 1, 0] } : { y: 0, rotate: 45, opacity: 0 }}
          transition={{ y: { duration: 0.55 / speed, delay: (0.3) / speed, ease: "easeIn" }, rotate: { duration: 0.55 / speed, delay: (0.3) / speed, ease: "linear" }, opacity: { duration: 0.55 / speed, delay: (0.3) / speed, times: [0, 0.15, 0.75, 1], ease: "linear" } }}
        />
        <motion.rect
          x="15.6" y="-2.6" width="1.6" height="1.6" rx="0.3" fill={accent} stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { y: [0, 11.4], rotate: [45, 225], opacity: [0, 1, 1, 0] } : { y: 0, rotate: 45, opacity: 0 }}
          transition={{ y: { duration: 0.55 / speed, delay: (0.24) / speed, ease: "easeIn" }, rotate: { duration: 0.55 / speed, delay: (0.24) / speed, ease: "linear" }, opacity: { duration: 0.55 / speed, delay: (0.24) / speed, times: [0, 0.15, 0.75, 1], ease: "linear" } }}
        />
      </svg>
      <motion.g
        style={{ originX: "50%", originY: "85.83%" }}
        initial={false}
        animate={on ? { y: [0, -1.4, 0, 0], scaleY: [1, 1.03, 0.94, 1] } : { y: 0, scaleY: 1 }}
        transition={{ duration: 0.6 / speed, times: [0, 0.35, 0.7, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M5.92 18.35L12.76 6.5A4.2 4.2 0 0 1 19.99 6.43A9.34 9.34 0 1 1 4.01 6.43A4.2 4.2 0 0 1 11.24 6.5L18.08 18.35" />
      </motion.g>

      </g>
    </svg>
  );
}
