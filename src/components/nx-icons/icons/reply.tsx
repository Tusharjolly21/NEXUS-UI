"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ReplyIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A curved arrow that draws itself back and flicks its head as the reply is sent. */
export function ReplyIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ReplyIconProps) {
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
        d="M9.5 5.5 4 11l5.5 5.5"
        stroke={accent}
        initial={false}
        animate={on ? { x: [0, -2.5, 0] } : { x: 0 }}
        transition={{ duration: 0.5 / speed, times: [0, 0.5, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M4 11h10a5 5 0 0 1 5 5v3.5"
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.4 / speed, ease: "easeOut" }}
      />
    </svg>
  );
}
