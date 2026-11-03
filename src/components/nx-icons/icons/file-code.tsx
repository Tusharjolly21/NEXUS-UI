"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FileCodeIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #40c8e0. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A source file where the left chevron types itself, a cursor blinks, and the right chevron follows. */
export function FileCodeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FileCodeIconProps) {
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
      <path d="M7 2.5h7l5.5 5.5v11a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 19V5A2.5 2.5 0 0 1 7 2.5z" />
      <path d="M14 2.5V6a2 2 0 0 0 2 2h3.5" />
      <motion.path
        d="M10 12.3 7.8 14.8l2.2 2.5"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.25 / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M12 13.2v3.2"
        stroke={accent}
        strokeWidth={1.5}
        initial={false}
        animate={on ? { opacity: [0, 1, 1, 0, 0, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.6 / speed, delay: (on ? 0.2 : 0) / speed, times: [0, 0.1, 0.35, 0.4, 0.55, 0.6, 1] }}
      />
      <motion.path
        d="M14 12.3l2.2 2.5-2.2 2.5"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.25 / speed, delay: (on ? 0.58 : 0) / speed, ease: "easeOut" },
          opacity: { duration: 0.25 / speed, delay: (on ? 0.58 : 0) / speed, times: [0, 0.05, 1] },
        }}
      />
    </svg>
  );
}
