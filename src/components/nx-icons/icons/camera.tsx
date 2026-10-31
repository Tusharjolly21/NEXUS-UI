"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CameraIconProps = {
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

/** A camera whose lens snaps shut and open, followed by a burst of flash. */
export function CameraIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CameraIconProps) {
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
      <path d="M4 8.5h2.6l1.4-2.2h8l1.4 2.2H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z" />
      <motion.circle
        cx="12"
        cy="13.4"
        r="3.5"
        initial={false}
        animate={on ? { scale: [1, 0.5, 1.15, 1] } : { scale: 1 }}
        transition={{ duration: 0.55 / speed, ease: "easeInOut" }}
      />
      <circle cx="17.6" cy="11.4" r="0.9" fill="currentColor" stroke="none" />
      <motion.path
        d="M19.4 2.2v2M22 4l-1.3 1.3M16.8 4l1.3 1.3"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 1, 1, 0], scale: [0.4, 1.1, 1] } : { opacity: 0, scale: 0.4 }}
        style={{ originX: "50%", originY: "100%" }}
        transition={on ? { duration: 0.6 / speed, delay: (0.22) / speed, times: [0, 0.2, 0.7, 1] } : { duration: 0.1 / speed }}
      />
    </svg>
  );
}
