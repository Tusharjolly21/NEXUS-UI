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

/** A projector whose beam cuts out, sweeps back on across the dimmed screen with a flicker, and settles. */
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
      <path d="M5.4 16.2V18.2 M10.6 16.2V18.2" />
      <path d="M4.9 7.8V6.3 M7.2 7.8V6.3" strokeWidth={strokeWidth * 0.65} />
      <rect x="2.5" y="7.8" width="10.9" height="8.4" rx="2.6" />
      <path d="M4.9 10.4V13.6" strokeWidth={strokeWidth * 0.65} />
      <motion.path
        d="M7.4 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"
        strokeWidth={strokeWidth * 0.65}
        style={{ originX: "39.17%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1, 0.8, 1.12, 1, 1] } : { scale: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.08, 0.22, 0.4, 0.52, 1] }}
      />
      <motion.path
        d="M21.7 5V19"
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { opacity: [1, 1, 0.3, 0.3, 1, 1] } : { opacity: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.08, 0.2, 0.46, 0.54, 1] }}
      />
      <motion.path
        d="M15.2 10.6L20.4 6.2V17.8L15.2 13.4Z"
        fill={accent}
        fillOpacity={0.6}
        stroke="none"
        style={{ originX: "63.33%", originY: "50%" }}
        initial={false}
        animate={on ? { opacity: [1, 0, 0, 1, 0.45, 1, 1], scaleX: [1, 1, 0.15, 1, 1, 1, 1] } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.08, 0.2, 0.5, 0.6, 0.7, 1] }}
      />
    </svg>
  );
}
