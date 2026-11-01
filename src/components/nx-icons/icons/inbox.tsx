"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type InboxIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A tray that catches a letter dropping in from above, and settles with a small bounce. */
export function InboxIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: InboxIconProps) {
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
        d="M8.5 9h7"
        stroke={accent}
        initial={false}
        animate={on ? { y: [-7, 0.8, 0], opacity: [0, 1, 1] } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.5 / speed, delay: (on ? 0.05 : 0) / speed, times: [0, 0.7, 1], ease: "easeIn" }}
      />
      <motion.g
        initial={false}
        animate={on ? { y: [0, 0, 0.8, 0] } : { y: 0 }}
        transition={{ duration: 0.6 / speed, times: [0, 0.45, 0.6, 0.8] }}
      >
        <path d="M3 13.5l2.2-8a2 2 0 0 1 1.9-1.5h9.8a2 2 0 0 1 1.9 1.5l2.2 8v4a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z" />
        <path d="M3 13.5h5.5a3.5 3.5 0 0 0 7 0H21" />
      </motion.g>
    </svg>
  );
}
