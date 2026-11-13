"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type StickyNoteIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffd60a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The note flutters on its sticky top edge while two lines of text are scribbled onto it. */
export function StickyNoteIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: StickyNoteIconProps) {
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
        style={{ originX: "30%", originY: "15%" }}
        initial={false}
        animate={on ? { rotate: [0, -6, 4, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M8 11H13"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: [0, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.4 / speed, delay: (on ? 0.3 : 0) / speed, ease: "easeOut", opacity: { duration: 0.01 / speed, delay: (on ? 0.3 : 0) / speed } }}
        />
        <motion.path
          d="M8 8.2H16"
          initial={false}
          animate={on ? { pathLength: [0, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.3 / speed, delay: (on ? 0.05 : 0) / speed, ease: "easeOut", opacity: { duration: 0.01 / speed, delay: (on ? 0.05 : 0) / speed } }}
        />
        <path d="M6.5 4H17.5A2.5 2.5 0 0 1 20 6.5V14L14 20H6.5A2.5 2.5 0 0 1 4 17.5V6.5A2.5 2.5 0 0 1 6.5 4Z" />
        <path d="M14 20V16.5A2.5 2.5 0 0 1 16.5 14H20" />
      </motion.g>
    </svg>
  );
}
