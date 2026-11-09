"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ProjectorIconProps = {
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

/** A projector whose beam flickers on, lights up the screen and then settles. */
export function ProjectorIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ProjectorIconProps) {
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
      <rect x="2.5" y="8" width="11" height="8" rx="2.4" />
      <path d="M5.5 16v2M10.5 16v2M21.5 4v16" />
      <circle cx="9.4" cy="12" r="1.7" strokeWidth={strokeWidth * 0.75} />
      <motion.path
        d="M13.5 10.4 21.5 5M13.5 13.6 21.5 19"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [1, 0, 1, 0.3, 1, 0.6, 1] } : { opacity: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.1, 0.25, 0.36, 0.46, 0.58, 1] }}
      />
      <motion.path
        d="M13.5 10.4 21.5 5v14l-8-5.4z"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { fillOpacity: [0, 0, 0.5, 0.2, 0.5, 0.35, 0] } : { fillOpacity: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.1, 0.28, 0.4, 0.5, 0.7, 1] }}
      />
    </svg>
  );
}
