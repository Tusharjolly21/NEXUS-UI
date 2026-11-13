"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WindsockIconProps = {
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

/** A striped windsock that streams out from its pole and ripples in the gusts. */
export function WindsockIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WindsockIconProps) {
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
        d="M9.2 5.15L9.2 11.04M14.4 5.99L14.4 10.78"
        stroke={accent}
        initial={false}
        animate={on ? { d: ["M9.2 5.15L9.2 11.04M14.4 5.99L14.4 10.78", "M9.2 5.25L9.2 11.14M14.4 5.49L14.4 10.28", "M9.2 5.45L9.2 11.34M14.4 5.36L14.4 10.15", "M9.2 5.05L9.2 10.94M14.4 6.48L14.4 11.27", "M9.2 4.85L9.2 10.74M14.4 6.61L14.4 11.4", "M9.2 5.15L9.2 11.04M14.4 5.99L14.4 10.78"] } : { d: "M9.2 5.15L9.2 11.04M14.4 5.99L14.4 10.78" }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M4 4.5C4.67 4.58 6.67 4.8 8 4.98C9.33 5.16 10.67 5.36 12 5.57C13.33 5.79 14.67 6.03 16 6.28C17.33 6.54 19.33 6.96 20 7.1L20 10.7C19.33 10.71 17.33 10.7 16 10.73C14.67 10.76 13.33 10.81 12 10.88C10.67 10.94 9.33 11.03 8 11.13C6.67 11.24 4.67 11.44 4 11.5Z"
        initial={false}
        animate={on ? { d: ["M4 4.5C4.67 4.58 6.67 4.8 8 4.98C9.33 5.16 10.67 5.36 12 5.57C13.33 5.79 14.67 6.03 16 6.28C17.33 6.54 19.33 6.96 20 7.1L20 10.7C19.33 10.71 17.33 10.7 16 10.73C14.67 10.76 13.33 10.81 12 10.88C10.67 10.94 9.33 11.03 8 11.13C6.67 11.24 4.67 11.44 4 11.5Z", "M4 4.5C4.67 4.64 6.67 5.24 8 5.32C9.33 5.39 10.67 4.84 12 4.97C13.33 5.1 14.67 5.51 16 6.11C17.33 6.7 19.33 8.12 20 8.53L20 12.13C19.33 11.86 17.33 10.86 16 10.56C14.67 10.25 13.33 10.12 12 10.27C10.67 10.42 9.33 11.26 8 11.47C6.67 11.67 4.67 11.49 4 11.5Z", "M4 4.5C4.67 4.61 6.67 4.9 8 5.15C9.33 5.4 10.67 6.01 12 6.02C13.33 6.02 14.67 4.91 16 5.17C17.33 5.43 19.33 7.16 20 7.56L20 11.16C19.33 10.91 17.33 9.59 16 9.62C14.67 9.65 13.33 11.04 12 11.32C10.67 11.6 9.33 11.27 8 11.3C6.67 11.33 4.67 11.47 4 11.5Z", "M4 4.5C4.67 4.52 6.67 4.37 8 4.65C9.33 4.93 10.67 5.88 12 6.18C13.33 6.48 14.67 6.54 16 6.46C17.33 6.37 19.33 5.8 20 5.67L20 9.27C19.33 9.55 17.33 10.54 16 10.91C14.67 11.28 13.33 11.5 12 11.48C10.67 11.46 9.33 10.79 8 10.8C6.67 10.8 4.67 11.38 4 11.5Z", "M4 4.5C4.67 4.55 6.67 4.71 8 4.81C9.33 4.92 10.67 4.7 12 5.13C13.33 5.56 14.67 7.14 16 7.39C17.33 7.64 19.33 6.76 20 6.64L20 10.24C19.33 10.5 17.33 11.81 16 11.84C14.67 11.88 13.33 10.58 12 10.43C10.67 10.29 9.33 10.78 8 10.96C6.67 11.14 4.67 11.41 4 11.5Z", "M4 4.5C4.67 4.58 6.67 4.8 8 4.98C9.33 5.16 10.67 5.36 12 5.57C13.33 5.79 14.67 6.03 16 6.28C17.33 6.54 19.33 6.96 20 7.1L20 10.7C19.33 10.71 17.33 10.7 16 10.73C14.67 10.76 13.33 10.81 12 10.88C10.67 10.94 9.33 11.03 8 11.13C6.67 11.24 4.67 11.44 4 11.5Z"] } : { d: "M4 4.5C4.67 4.58 6.67 4.8 8 4.98C9.33 5.16 10.67 5.36 12 5.57C13.33 5.79 14.67 6.03 16 6.28C17.33 6.54 19.33 6.96 20 7.1L20 10.7C19.33 10.71 17.33 10.7 16 10.73C14.67 10.76 13.33 10.81 12 10.88C10.67 10.94 9.33 11.03 8 11.13C6.67 11.24 4.67 11.44 4 11.5Z" }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      />
      <path d="M4 2.5V21.5" />
    </svg>
  );
}
