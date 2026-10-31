"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SettingsIconProps = {
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

/** Two gears that mesh and turn against each other, the small one in the accent colour. */
export function SettingsIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SettingsIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
        style={{ originX: "50%", originY: "50%" }}
        strokeWidth={1.6}
        initial={false}
        animate={{ rotate: on ? 90 : 0 }}
        transition={{ type: "spring", stiffness: 140 * speed * speed, damping: 14 * speed }}
      >
        <path d="M8.1 4.39L8.33 2.64L9.67 2.64L9.9 4.39L11.63 5.1L13.03 4.03L13.97 4.97L12.9 6.37L13.61 8.1L15.36 8.33L15.36 9.67L13.61 9.9L12.9 11.63L13.97 13.03L13.03 13.97L11.63 12.9L9.9 13.61L9.67 15.36L8.33 15.36L8.1 13.61L6.37 12.9L4.97 13.97L4.03 13.03L5.1 11.63L4.39 9.9L2.64 9.67L2.64 8.33L4.39 8.1L5.1 6.37L4.03 4.97L4.97 4.03L6.37 5.1Z" />
        <circle cx="9" cy="9" r="1.8" />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        strokeWidth={1.6}
        initial={false}
        animate={{ rotate: on ? -120 : 0 }}
        transition={{ type: "spring", stiffness: 140 * speed * speed, damping: 14 * speed }}
      >
        <path d="M16.05 13.79L16.24 12.23L17.36 12.23L17.55 13.79L19.03 14.65L20.47 14.03L21.03 15L19.78 15.95L19.78 17.65L21.03 18.6L20.47 19.57L19.03 18.95L17.55 19.81L17.36 21.37L16.24 21.37L16.05 19.81L14.57 18.95L13.13 19.57L12.57 18.6L13.82 17.65L13.82 15.95L12.57 15L13.13 14.03L14.57 14.65Z" stroke={accent} />
        <circle cx="16.8" cy="16.8" r="1.1" stroke={accent} />
      </motion.g>
    </svg>
  );
}
