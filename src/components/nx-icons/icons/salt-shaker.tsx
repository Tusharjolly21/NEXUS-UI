"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SaltShakerIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #8e9aaf. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A salt shaker tips over, gives two firm shakes that sprinkle salt from its holes and stands back up. */
export function SaltShakerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SaltShakerIconProps) {
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
      <g transform="translate(0 -0.33)">

      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.rect
          x="3.52" y="3.85" width="1.5" height="1.5" rx="0.3" fill={accent} stroke="none"
          initial={false}
          animate={on ? { y: [0, 5.6], x: [0, -0.6], opacity: [0, 1, 1, 0] } : { y: 0, x: 0, opacity: 0 }}
          transition={{ y: { duration: 0.42 / speed, delay: (0.34) / speed, ease: "easeIn" }, x: { duration: 0.42 / speed, delay: (0.34) / speed, ease: "easeIn" }, opacity: { duration: 0.42 / speed, delay: (0.34) / speed, times: [0, 0.12, 0.7, 1], ease: "linear" } }}
        />
        <motion.rect
          x="4.2" y="2.74" width="1.5" height="1.5" rx="0.3" fill={accent} stroke="none"
          initial={false}
          animate={on ? { y: [0, 6.4], x: [0, -0.9], opacity: [0, 1, 1, 0] } : { y: 0, x: 0, opacity: 0 }}
          transition={{ y: { duration: 0.42 / speed, delay: (0.38) / speed, ease: "easeIn" }, x: { duration: 0.42 / speed, delay: (0.38) / speed, ease: "easeIn" }, opacity: { duration: 0.42 / speed, delay: (0.38) / speed, times: [0, 0.12, 0.7, 1], ease: "linear" } }}
        />
        <motion.rect
          x="5.46" y="2.44" width="1.5" height="1.5" rx="0.3" fill={accent} stroke="none"
          initial={false}
          animate={on ? { y: [0, 7.2], x: [0, -1.2], opacity: [0, 1, 1, 0] } : { y: 0, x: 0, opacity: 0 }}
          transition={{ y: { duration: 0.42 / speed, delay: (0.42) / speed, ease: "easeIn" }, x: { duration: 0.42 / speed, delay: (0.42) / speed, ease: "easeIn" }, opacity: { duration: 0.42 / speed, delay: (0.42) / speed, times: [0, 0.12, 0.7, 1], ease: "linear" } }}
        />
        <motion.rect
          x="3.52" y="3.85" width="1.5" height="1.5" rx="0.3" fill={accent} stroke="none"
          initial={false}
          animate={on ? { y: [0, 5.6], x: [0, -0.6], opacity: [0, 1, 1, 0] } : { y: 0, x: 0, opacity: 0 }}
          transition={{ y: { duration: 0.42 / speed, delay: (0.56) / speed, ease: "easeIn" }, x: { duration: 0.42 / speed, delay: (0.56) / speed, ease: "easeIn" }, opacity: { duration: 0.42 / speed, delay: (0.56) / speed, times: [0, 0.12, 0.7, 1], ease: "linear" } }}
        />
        <motion.rect
          x="4.2" y="2.74" width="1.5" height="1.5" rx="0.3" fill={accent} stroke="none"
          initial={false}
          animate={on ? { y: [0, 6.4], x: [0, -0.9], opacity: [0, 1, 1, 0] } : { y: 0, x: 0, opacity: 0 }}
          transition={{ y: { duration: 0.42 / speed, delay: (0.6) / speed, ease: "easeIn" }, x: { duration: 0.42 / speed, delay: (0.6) / speed, ease: "easeIn" }, opacity: { duration: 0.42 / speed, delay: (0.6) / speed, times: [0, 0.12, 0.7, 1], ease: "linear" } }}
        />
        <motion.rect
          x="5.46" y="2.44" width="1.5" height="1.5" rx="0.3" fill={accent} stroke="none"
          initial={false}
          animate={on ? { y: [0, 7.2], x: [0, -1.2], opacity: [0, 1, 1, 0] } : { y: 0, x: 0, opacity: 0 }}
          transition={{ y: { duration: 0.42 / speed, delay: (0.64) / speed, ease: "easeIn" }, x: { duration: 0.42 / speed, delay: (0.64) / speed, ease: "easeIn" }, opacity: { duration: 0.42 / speed, delay: (0.64) / speed, times: [0, 0.12, 0.7, 1], ease: "linear" } }}
        />
      </svg>
      <motion.g
        style={{ originX: "50%", originY: "55%" }}
        initial={false}
        animate={on ? { rotate: [0, -36, -24, -36, -24, -36, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.24, 0.36, 0.46, 0.58, 0.68, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M7.2 12L16.8 12L17.43 19.04A1.8 1.8 0 0 1 15.63 21L8.37 21A1.8 1.8 0 0 1 6.57 19.04Z" />
        <path d="M7.2 12A4.8 8.3 0 0 1 16.8 12" />
        <g fill="currentColor" stroke="none">
          <circle cx="12" cy="6.6" r="0.78" />
          <circle cx="10.55" cy="8.9" r="0.78" />
          <circle cx="13.45" cy="8.9" r="0.78" />
        </g>
      </motion.g>

      </g>
    </svg>
  );
}
