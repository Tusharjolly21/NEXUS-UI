"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MailOpenIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #32ade6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An envelope flap flips shut and swings open again while a letter slides up out of the envelope and back in. */
export function MailOpenIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MailOpenIconProps) {
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
      <path d="M3 10v8.4A1.6 1.6 0 0 0 4.6 20h14.8a1.6 1.6 0 0 0 1.6-1.6V10" />
      <motion.path
        d="M8.6 12.8V12.8H15.4V12.8"
        stroke={accent}
        strokeWidth={1.6}
        initial={false}
        animate={on ? { d: ["M8.6 12.8V12.8H15.4V12.8", "M8.6 12.8V12.8H15.4V12.8", "M8.6 12.8V4.8H15.4V12.8", "M8.6 12.8V4.8H15.4V12.8", "M8.6 12.8V12.8H15.4V12.8"], opacity: [0, 0, 1, 1, 0] } : { d: "M8.6 12.8V12.8H15.4V12.8", opacity: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.3, 0.6, 0.72, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M10.8 7.8H13.2M10.8 10.2H13.2"
        stroke={accent}
        strokeWidth={1.4}
        initial={false}
        animate={on ? { opacity: [0, 0, 1, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.5, 0.62, 0.72, 0.8], ease: "easeInOut" }}
      />
      <path d="M3 10l9 6.2 9-6.2" />
      <motion.g
        style={{ originX: "50%", originY: "41.7%" }}
        initial={false}
        animate={on ? { scaleY: [1, -0.94, 1.08, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.7 / speed, times: [0, 0.35, 0.75, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3 10 12 3.4 21 10" />
      </motion.g>
    </svg>
  );
}
