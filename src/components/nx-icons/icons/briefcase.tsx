"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BriefcaseIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #c2763b. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A briefcase that hops, lands with a thump and snaps its clasp. */
export function BriefcaseIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BriefcaseIconProps) {
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
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { y: [0, -2.4, 0], scaleY: [1, 1.05, 0.94] } : { y: 0, scaleY: 1 }}
        transition={{ duration: 0.55 / speed, times: [0, 0.45, 1], ease: ["easeOut", "easeIn"] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <rect x="3" y="8" width="18" height="12.5" rx="2.4" />
        <path d="M9 8V6.4A1.9 1.9 0 0 1 10.9 4.5h2.2A1.9 1.9 0 0 1 15 6.4V8" />
        <path d="M3.5 13.5H8.6M15.4 13.5h5.1" />
        <motion.rect
          x="10.6"
          y="12.2"
          width="2.8"
          height="3"
          rx="0.6"
          stroke={accent}
          strokeWidth={1.5}
          fill={accent}
          fillOpacity={0.25}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1, 1.5, 1] } : { scale: 1 }}
          transition={{ duration: 0.55 / speed, times: [0, 0.8, 0.9, 1] }}
        />
      </motion.g>
    </svg>
  );
}
