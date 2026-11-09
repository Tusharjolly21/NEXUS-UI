"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type OrangeSliceIconProps = {
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

/** A citrus slice whose eight segments light up one after another around the wheel. */
export function OrangeSliceIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: OrangeSliceIconProps) {
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
      <circle cx="12" cy="12" r="9.4" />
      <path d="M12 6A3.38 3.38 0 0 1 16.24 7.76A3.38 3.38 0 0 1 18 12A3.38 3.38 0 0 1 16.24 16.24A3.38 3.38 0 0 1 12 18A3.38 3.38 0 0 1 7.76 16.24A3.38 3.38 0 0 1 6 12A3.38 3.38 0 0 1 7.76 7.76A3.38 3.38 0 0 1 12 6z" strokeWidth={strokeWidth * 0.75} />
      <path d="M12 9.3L12 6M13.91 10.09L16.24 7.76M14.7 12L18 12M13.91 13.91L16.24 16.24M12 14.7L12 18M10.09 13.91L7.76 16.24M9.3 12L6 12M10.09 10.09L7.76 7.76" strokeWidth={strokeWidth * 0.75} />
      <motion.path
        d="M13.1 8.3L13.1 7A5.12 5.12 0 0 1 14.76 7.69L13.84 8.61A3.86 3.86 0 0 0 13.1 8.3z"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { opacity: [0, 0.95, 0] } : { opacity: 0 }}
        transition={{ duration: 0.3 / speed, delay: (0.04) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M15.39 10.16L16.31 9.24A5.12 5.12 0 0 1 17 10.9L15.7 10.9A3.86 3.86 0 0 0 15.39 10.16z"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { opacity: [0, 0.95, 0] } : { opacity: 0 }}
        transition={{ duration: 0.3 / speed, delay: (0.12) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M15.7 13.1L17 13.1A5.12 5.12 0 0 1 16.31 14.76L15.39 13.84A3.86 3.86 0 0 0 15.7 13.1z"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { opacity: [0, 0.95, 0] } : { opacity: 0 }}
        transition={{ duration: 0.3 / speed, delay: (0.2) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M13.84 15.39L14.76 16.31A5.12 5.12 0 0 1 13.1 17L13.1 15.7A3.86 3.86 0 0 0 13.84 15.39z"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { opacity: [0, 0.95, 0] } : { opacity: 0 }}
        transition={{ duration: 0.3 / speed, delay: (0.28) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M10.9 15.7L10.9 17A5.12 5.12 0 0 1 9.24 16.31L10.16 15.39A3.86 3.86 0 0 0 10.9 15.7z"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { opacity: [0, 0.95, 0] } : { opacity: 0 }}
        transition={{ duration: 0.3 / speed, delay: (0.36) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M8.61 13.84L7.69 14.76A5.12 5.12 0 0 1 7 13.1L8.3 13.1A3.86 3.86 0 0 0 8.61 13.84z"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { opacity: [0, 0.95, 0] } : { opacity: 0 }}
        transition={{ duration: 0.3 / speed, delay: (0.44) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M8.3 10.9L7 10.9A5.12 5.12 0 0 1 7.69 9.24L8.61 10.16A3.86 3.86 0 0 0 8.3 10.9z"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { opacity: [0, 0.95, 0] } : { opacity: 0 }}
        transition={{ duration: 0.3 / speed, delay: (0.52) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M10.16 8.61L9.24 7.69A5.12 5.12 0 0 1 10.9 7L10.9 8.3A3.86 3.86 0 0 0 10.16 8.61z"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { opacity: [0, 0.95, 0] } : { opacity: 0 }}
        transition={{ duration: 0.3 / speed, delay: (0.6) / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
