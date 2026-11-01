"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type DownloadIconProps = {
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

/** An arrow that drops into a tray, which lights up as it lands, then comes back for the next file. */
export function DownloadIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: DownloadIconProps) {
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
        initial={false}
        animate={on ? { y: [0, 6, -6, 0], opacity: [1, 0, 0, 1] } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.35, 0.36, 0.8], ease: "easeInOut" }}
      >
        <path d="M12 3.5v11" />
        <path d="M7.5 10.5 12 15l4.5-4.5" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { y: [0, 0, 0.9, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.42, 0.6] }}
      >
        <path d="M4 16.5v2.5a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5v-2.5" />
        <motion.path
          d="M4 16.5v2.5a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5v-2.5"
          stroke={accent}
          initial={false}
          animate={on ? { opacity: [0, 0, 1, 1, 0] } : { opacity: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.33, 0.4, 0.85, 1] }}
        />
      </motion.g>
    </svg>
  );
}
