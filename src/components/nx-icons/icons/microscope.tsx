"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MicroscopeIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The stage knob turns a full circle while the sample on the stage glows and pulses a ring of light. */
export function MicroscopeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MicroscopeIconProps) {
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
      <path d="M5 21H20" />
      <path d="M16.7 17.9V21" />
      <path d="M8.091 4.895C11.291 4.295 16.7 7.9 16.7 13.1" />
      <path d="M12.721 5.27L10.761 9.82 M8.679 3.53L6.719 8.08 M12.721 5.27L8.679 3.53 M10.761 9.82L6.719 8.08" />
      <path d="M11.373 2.839L10.7 4.4" />
      <path d="M8.74 8.95L7.9 10.9" />
      <path d="M4 15.5H14.3" />
      <circle cx="16.7" cy="15.5" r="2.4" />
      <motion.g
        style={{ originX: "69.583%", originY: "64.583%" }}
        initial={false}
        animate={on ? { rotate: [0, 360, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.999, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M16.7 15.5V14.8" strokeWidth={strokeWidth * 0.75} />
      </motion.g>
      <motion.circle
        cx="7.9"
        cy="13.7"
        r="0.9"
        stroke={accent}
        fill="none"
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { r: [0.9, 0.9, 3.1], opacity: [0, 0.85, 0] } : { r: 0.9, opacity: 0 }}
        transition={{ duration: 0.8 / speed, delay: (0.25) / speed, times: [0, 0.01, 1], ease: "easeOut" }}
      />
      <motion.circle
        cx="7.9"
        cy="13.7"
        r="0.9"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.6, 1, 1.4, 1] } : { scale: 1 }}
        transition={{ duration: 0.9 / speed, delay: (0.2) / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
