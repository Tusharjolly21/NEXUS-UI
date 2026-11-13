"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChartTreemapIconProps = {
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

/** The treemap's dividers slide left, then right, and settle as the tiles resize like live data. */
export function ChartTreemapIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ChartTreemapIconProps) {
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
        d="M16 11V19.5"
        stroke={accent}
        initial={false}
        animate={on ? { d: ["M16 11V19.5", "M14.5 11V19.5", "M17 11V19.5", "M16 11V19.5"] } : { d: "M16 11V19.5" }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.65, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M11 11H21"
        initial={false}
        animate={on ? { d: ["M11 11H21", "M8 11H21", "M13 11H21", "M11 11H21"] } : { d: "M11 11H21" }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.65, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M11 4.5V19.5"
        initial={false}
        animate={on ? { d: ["M11 4.5V19.5", "M8 4.5V19.5", "M13 4.5V19.5", "M11 4.5V19.5"] } : { d: "M11 4.5V19.5" }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.65, 1], ease: "easeInOut" }}
      />
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
    </svg>
  );
}
