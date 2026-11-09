"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RabbitIconProps = {
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

/** A rabbit whose ears twitch in turn before its nose and whiskers wiggle. */
export function RabbitIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RabbitIconProps) {
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
        style={{ originX: "35.12%", originY: "44.82%" }}
        initial={false}
        animate={on ? { rotate: [0, -11, 3, -6, 0, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.12, 0.24, 0.36, 0.5, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M6.57 11.74A2.25 5.6 -9 1 1 10.29 9.78" />
      </motion.g>
      <motion.g
        style={{ originX: "64.88%", originY: "44.82%" }}
        initial={false}
        animate={on ? { rotate: [0, 11, -3, 6, 0, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, delay: (on ? 0.3 : 0) / speed, times: [0, 0.12, 0.24, 0.36, 0.5, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M13.71 9.78A2.25 5.6 9 1 1 17.43 11.74" />
      </motion.g>
      <path d="M19 15.4A7 5.8 0 0 1 5 15.4A7 5.8 0 0 1 19 15.4" />
      <circle cx="8.9" cy="14.2" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.1" cy="14.2" r="1" fill="currentColor" stroke="none" />
      <motion.g
        initial={false}
        animate={on ? { x: [0, 0.6, -0.6, 0.5, -0.4, 0] } : { x: 0 }}
        transition={{ duration: 0.5 / speed, delay: (on ? 0.55 : 0) / speed, ease: "easeInOut" }}
      >
        <path d="M10.9 15.5L13.1 15.5L12 17Z" fill={accent} stroke={accent} strokeWidth={1.2} />
        <path d="M12 17V17.9M10.3 18.5Q11.5 19.1 12 17.9Q12.5 19.1 13.7 18.5" strokeWidth={1.4} />
      </motion.g>
      <motion.g
        style={{ originX: "21.76%", originY: "70.21%" }}
        initial={false}
        animate={on ? { rotate: [0, 8, -8, 7, -5, 0] } : { rotate: 0 }}
        transition={{ duration: 0.5 / speed, delay: (on ? 0.55 : 0) / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M5.03 15.9L2.53 14.9M5.63 17.8L3.13 18.8" strokeWidth={1.4} />
      </motion.g>
      <motion.g
        style={{ originX: "78.24%", originY: "70.21%" }}
        initial={false}
        animate={on ? { rotate: [0, -8, 8, -7, 5, 0] } : { rotate: 0 }}
        transition={{ duration: 0.5 / speed, delay: (on ? 0.55 : 0) / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M18.97 15.9L21.47 14.9M18.37 17.8L20.87 18.8" strokeWidth={1.4} />
      </motion.g>
    </svg>
  );
}
