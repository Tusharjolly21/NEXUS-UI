"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type NotebookIconProps = {
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

/** A spiral notebook whose cover swings open a little while the ruled lines write themselves onto the page. */
export function NotebookIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: NotebookIconProps) {
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
        d="M6.5 4.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2z"
        initial={false}
        animate={on ? { opacity: [0, 1, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.1, 0.8, 1] }}
      />
      <motion.path
        d="M12 12H17.5M12 16H17.5"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.4 / speed, delay: (0.3) / speed }}
      />
      <motion.g
        style={{ originX: "27%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleX: [1, 0.78, 0.78, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.28, 0.7, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M6.5 4.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2z" />
        <path d="M12 7H17.5" stroke={accent} />
      </motion.g>
      <path d="M3.5 6H9.5M3.5 10H9.5M3.5 14H9.5M3.5 18H9.5" />
    </svg>
  );
}
