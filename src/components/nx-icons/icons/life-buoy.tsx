"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LifeBuoyIconProps = {
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

/** A life buoy that bobs and rocks on the swell, its red bands swinging round. */
export function LifeBuoyIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LifeBuoyIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, -14, 10, -5, 0], y: [0, -0.8, 0.5, -0.3, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M15.56 13.59L20.5 15.78A9.3 9.3 0 0 1 15.78 20.5L13.59 15.56A3.9 3.9 0 0 0 15.56 13.59Z" fill={accent} fillOpacity={0.4} stroke="none" />
        <path d="M10.41 15.56L8.22 20.5A9.3 9.3 0 0 1 3.5 15.78L8.44 13.59A3.9 3.9 0 0 0 10.41 15.56Z" fill={accent} fillOpacity={0.4} stroke="none" />
        <path d="M8.44 10.41L3.5 8.22A9.3 9.3 0 0 1 8.22 3.5L10.41 8.44A3.9 3.9 0 0 0 8.44 10.41Z" fill={accent} fillOpacity={0.4} stroke="none" />
        <path d="M13.59 8.44L15.78 3.5A9.3 9.3 0 0 1 20.5 8.22L15.56 10.41A3.9 3.9 0 0 0 13.59 8.44Z" fill={accent} fillOpacity={0.4} stroke="none" />
        <circle cx="12" cy="12" r="9.3" />
        <circle cx="12" cy="12" r="3.9" />
      </motion.g>
    </svg>
  );
}
