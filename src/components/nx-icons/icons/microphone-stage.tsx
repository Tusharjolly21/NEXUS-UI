"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MicrophoneStageIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A stage microphone that tilts as if sung into while rings of sound pulse out from its capsule. */
export function MicrophoneStageIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MicrophoneStageIconProps) {
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
        style={{ originX: "50%", originY: "69.38%" }}
        initial={false}
        animate={on ? { rotate: [0, -13, 7, -4, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="12" cy="6.85" r="4.1" />
        <path d="M8.11 5.55H15.89M8.11 8.15H15.89" stroke={accent} strokeWidth={1} />
        <path d="M9.6 10.17L10.5 16.65H13.5L14.4 10.17" />
        <path d="M10.06 13.5H13.94" stroke={accent} strokeWidth={1.4} />
      </motion.g>
      <path d="M12 16.65V21.25M7.5 21.25H16.5" />
      <motion.path
        d="M17.79 3.09A6.9 6.9 0 0 1 17.79 10.61"
        stroke={accent}
        strokeWidth={1.4}
        initial={false}
        animate={on ? { pathLength: [0, 1, 1, 0, 1, 1], opacity: [0, 1, 0, 0, 1, 0] } : { pathLength: 1, opacity: 0 }}
        transition={{ duration: 0.8 / speed, delay: (0.12) / speed, times: [0, 0.2, 0.45, 0.5, 0.7, 1] }}
      />
      <motion.path
        d="M6.21 10.61A6.9 6.9 0 0 0 6.21 3.09"
        stroke={accent}
        strokeWidth={1.4}
        initial={false}
        animate={on ? { pathLength: [0, 1, 1, 0, 1, 1], opacity: [0, 1, 0, 0, 1, 0] } : { pathLength: 1, opacity: 0 }}
        transition={{ duration: 0.8 / speed, delay: (0.12) / speed, times: [0, 0.2, 0.45, 0.5, 0.7, 1] }}
      />
      <motion.path
        d="M20.05 1.62A9.6 9.6 0 0 1 20.05 12.08"
        stroke={accent}
        strokeWidth={1.4}
        initial={false}
        animate={on ? { pathLength: [0, 1, 1, 0, 1, 1], opacity: [0, 1, 0, 0, 1, 0] } : { pathLength: 1, opacity: 0 }}
        transition={{ duration: 0.8 / speed, delay: (0.3) / speed, times: [0, 0.2, 0.45, 0.5, 0.7, 1] }}
      />
      <motion.path
        d="M3.95 12.08A9.6 9.6 0 0 0 3.95 1.62"
        stroke={accent}
        strokeWidth={1.4}
        initial={false}
        animate={on ? { pathLength: [0, 1, 1, 0, 1, 1], opacity: [0, 1, 0, 0, 1, 0] } : { pathLength: 1, opacity: 0 }}
        transition={{ duration: 0.8 / speed, delay: (0.3) / speed, times: [0, 0.2, 0.45, 0.5, 0.7, 1] }}
      />
    </svg>
  );
}
