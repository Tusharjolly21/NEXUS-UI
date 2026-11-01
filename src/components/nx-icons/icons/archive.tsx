"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ArchiveIconProps = {
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

/** A storage box whose lid lifts and drops back with a thunk. */
export function ArchiveIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ArchiveIconProps) {
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
      <motion.rect
        x="2.6"
        y="3.4"
        width="18.8"
        height="4.6"
        rx="1.2"
        initial={false}
        animate={on ? { y: [0, -2.4, 0] } : { y: 0 }}
        transition={{ duration: 0.55 / speed, times: [0, 0.4, 1], ease: ["easeOut", "easeIn"] }}
      />
      <path d="M4.6 8v10.4a2.2 2.2 0 0 0 2.2 2.2h10.4a2.2 2.2 0 0 0 2.2-2.2V8" />
      <motion.path
        d="M9.8 12.2h4.4"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [1, 0.2, 1] } : { opacity: 1 }}
        transition={{ duration: 0.55 / speed }}
      />
    </svg>
  );
}
