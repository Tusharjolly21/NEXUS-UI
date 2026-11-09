"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BarnIconProps = {
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

/** A barn whose big X braced doors swing open a little in perspective and close again. */
export function BarnIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BarnIconProps) {
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
      <motion.path
        d="M7 13L12 17L7 21"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { d: ["M7 13L12 17L7 21", "M7 13L11.86 17L7 21", "M7 13L11.49 17L7 21", "M7 13L11.01 17L7 21", "M7 13L10.53 17L7 21", "M7 13L10.2 17L7 21", "M7 13L10.08 17L7 21", "M7 13L10.08 17L7 21", "M7 13L10.08 17L7 21", "M7 13L10.12 17L7 21", "M7 13L10.34 17L7 21", "M7 13L10.68 17L7 21", "M7 13L11.07 17L7 21", "M7 13L11.43 17L7 21", "M7 13L11.71 17L7 21", "M7 13L11.89 17L7 21", "M7 13L11.97 17L7 21", "M7 13L12 17L7 21", "M7 13L12 17L7 21"] } : { d: "M7 13L12 17L7 21" }}
        transition={{ duration: 0.9 / speed, ease: "linear" }}
      />
      <motion.path
        d="M17 13L12 17L17 21"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { d: ["M17 13L12 17L17 21", "M17 13L12.14 17L17 21", "M17 13L12.51 17L17 21", "M17 13L12.99 17L17 21", "M17 13L13.47 17L17 21", "M17 13L13.8 17L17 21", "M17 13L13.92 17L17 21", "M17 13L13.92 17L17 21", "M17 13L13.92 17L17 21", "M17 13L13.88 17L17 21", "M17 13L13.66 17L17 21", "M17 13L13.32 17L17 21", "M17 13L12.93 17L17 21", "M17 13L12.57 17L17 21", "M17 13L12.29 17L17 21", "M17 13L12.11 17L17 21", "M17 13L12.03 17L17 21", "M17 13L12 17L17 21", "M17 13L12 17L17 21"] } : { d: "M17 13L12 17L17 21" }}
        transition={{ duration: 0.9 / speed, ease: "linear" }}
      />
      <path d="M3 21V12L6 6.5 12 3l6 3.5 3 5.5V21Z" />
      <path d="M7 21V13H17V21" strokeWidth={strokeWidth * 0.75} />
      <motion.path
        d="M7 13L12 13L12 21L7 21Z"
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { d: ["M7 13L12 13L12 21L7 21Z", "M7 13L11.86 13.19L11.86 20.81L7 21Z", "M7 13L11.49 13.35L11.49 20.65L7 21Z", "M7 13L11.01 13.48L11.01 20.52L7 21Z", "M7 13L10.53 13.57L10.53 20.43L7 21Z", "M7 13L10.2 13.61L10.2 20.39L7 21Z", "M7 13L10.08 13.63L10.08 20.37L7 21Z", "M7 13L10.08 13.63L10.08 20.37L7 21Z", "M7 13L10.08 13.63L10.08 20.37L7 21Z", "M7 13L10.12 13.63L10.12 20.37L7 21Z", "M7 13L10.34 13.6L10.34 20.4L7 21Z", "M7 13L10.68 13.54L10.68 20.46L7 21Z", "M7 13L11.07 13.47L11.07 20.53L7 21Z", "M7 13L11.43 13.37L11.43 20.63L7 21Z", "M7 13L11.71 13.27L11.71 20.73L7 21Z", "M7 13L11.89 13.17L11.89 20.83L7 21Z", "M7 13L11.97 13.08L11.97 20.92L7 21Z", "M7 13L12 13.02L12 20.98L7 21Z", "M7 13L12 13L12 21L7 21Z"] } : { d: "M7 13L12 13L12 21L7 21Z" }}
        transition={{ duration: 0.9 / speed, ease: "linear" }}
      />
      <motion.path
        d="M17 13L12 13L12 21L17 21Z"
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { d: ["M17 13L12 13L12 21L17 21Z", "M17 13L12.14 13.19L12.14 20.81L17 21Z", "M17 13L12.51 13.35L12.51 20.65L17 21Z", "M17 13L12.99 13.48L12.99 20.52L17 21Z", "M17 13L13.47 13.57L13.47 20.43L17 21Z", "M17 13L13.8 13.61L13.8 20.39L17 21Z", "M17 13L13.92 13.63L13.92 20.37L17 21Z", "M17 13L13.92 13.63L13.92 20.37L17 21Z", "M17 13L13.92 13.63L13.92 20.37L17 21Z", "M17 13L13.88 13.63L13.88 20.37L17 21Z", "M17 13L13.66 13.6L13.66 20.4L17 21Z", "M17 13L13.32 13.54L13.32 20.46L17 21Z", "M17 13L12.93 13.47L12.93 20.53L17 21Z", "M17 13L12.57 13.37L12.57 20.63L17 21Z", "M17 13L12.29 13.27L12.29 20.73L17 21Z", "M17 13L12.11 13.17L12.11 20.83L17 21Z", "M17 13L12.03 13.08L12.03 20.92L17 21Z", "M17 13L12 13.02L12 20.98L17 21Z", "M17 13L12 13L12 21L17 21Z"] } : { d: "M17 13L12 13L12 21L17 21Z" }}
        transition={{ duration: 0.9 / speed, ease: "linear" }}
      />
    </svg>
  );
}
