"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type VolcanoIconProps = {
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

/** A volcano that shakes and erupts, throwing lava sparks while smoke rises and lava streams flow. */
export function VolcanoIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: VolcanoIconProps) {
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
        animate={on ? { x: [0, -0.5, 0.5, -0.45, 0.4, -0.2, 0] } : { x: 0 }}
        transition={{ duration: 0.55 / speed, delay: (on ? 0.08 : 0) / speed, ease: "linear" }}
      >
        <path d="M2.8 21.5Q6 15.7 8.8 9.9Q12 13.5 15.2 9.9Q18 15.7 21.2 21.5Z" />
        <motion.path
          d="M10.3 11.19C10.3 12.99 9.4 13.79 9.4 15.79"
          stroke={accent}
          strokeWidth={strokeWidth * 0.75}
          initial={false}
          animate={on ? { pathLength: [0, 0, 1], opacity: [0, 0, 1, 1] } : { pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9 / speed, ease: "easeOut", pathLength: { times: [0, 0.3, 1] }, opacity: { times: [0, 0.3, 0.32, 1], ease: "linear" } }}
        />
        <motion.path
          d="M13.7 11.19C13.7 12.59 14.4 13.09 14.4 14.39"
          stroke={accent}
          strokeWidth={strokeWidth * 0.75}
          initial={false}
          animate={on ? { pathLength: [0, 0, 1], opacity: [0, 0, 1, 1] } : { pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9 / speed, ease: "easeOut", pathLength: { times: [0, 0.4, 1] }, opacity: { times: [0, 0.4, 0.42000000000000004, 1], ease: "linear" } }}
        />
      </motion.g>
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.circle
          cx="11.6"
          cy="7.1"
          r="0.9"
          fill="currentColor"
          stroke="none"
          initial={false}
          animate={on ? { y: [0, -2.4, 2.2, 0], opacity: [1, 0, 0, 1] } : { y: 0, opacity: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.4, 0.5, 1], delay: (on ? 0 : 0) / speed, ease: "easeOut" }}
        />
        <motion.circle
          cx="13.4"
          cy="4.9"
          r="1.1"
          fill="currentColor"
          stroke="none"
          initial={false}
          animate={on ? { y: [0, -2.4, 2.2, 0], opacity: [1, 0, 0, 1] } : { y: 0, opacity: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.4, 0.5, 1], delay: (on ? 0.05 : 0) / speed, ease: "easeOut" }}
        />
        <motion.circle
          cx="11.4"
          cy="2.8"
          r="1.3"
          fill="currentColor"
          stroke="none"
          initial={false}
          animate={on ? { y: [0, -2.4, 2.2, 0], opacity: [1, 0, 0, 1] } : { y: 0, opacity: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.4, 0.5, 1], delay: (on ? 0.1 : 0) / speed, ease: "easeOut" }}
        />
        <motion.path
          d="M10.5 10.5h.01"
          stroke={accent}
          strokeWidth={2.6}
          initial={false}
          animate={on ? { x: [0, 0, -1.92, -3.2], y: [0, 0, -6.4, -3.2], opacity: [0, 1, 1, 0] } : { x: 0, y: 0, opacity: 0 }}
          transition={{ duration: 0.62 / speed, times: [0, 0.03, 0.5, 1], delay: (on ? 0.1 : 0) / speed, ease: ["linear", "easeOut", "easeIn"] }}
        />
        <motion.path
          d="M12 10.5h.01"
          stroke={accent}
          strokeWidth={2.6}
          initial={false}
          animate={on ? { x: [0, 0, 0.18, 0.3], y: [0, 0, -8, -4.8], opacity: [0, 1, 1, 0] } : { x: 0, y: 0, opacity: 0 }}
          transition={{ duration: 0.62 / speed, times: [0, 0.03, 0.5, 1], delay: (on ? 0.22 : 0) / speed, ease: ["linear", "easeOut", "easeIn"] }}
        />
        <motion.path
          d="M13.5 10.5h.01"
          stroke={accent}
          strokeWidth={2.6}
          initial={false}
          animate={on ? { x: [0, 0, 2.04, 3.4], y: [0, 0, -6, -2.8], opacity: [0, 1, 1, 0] } : { x: 0, y: 0, opacity: 0 }}
          transition={{ duration: 0.62 / speed, times: [0, 0.03, 0.5, 1], delay: (on ? 0.34 : 0) / speed, ease: ["linear", "easeOut", "easeIn"] }}
        />
      </svg>
    </svg>
  );
}
