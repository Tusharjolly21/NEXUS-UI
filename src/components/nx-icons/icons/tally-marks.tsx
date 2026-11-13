"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TallyMarksIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff453a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Four strokes are scratched in one by one, then a slash strikes through them to make a group of five. */
export function TallyMarksIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TallyMarksIconProps) {
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
        d="M3.2 16.8L20.8 7.2"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.3 / speed, delay: (on ? 0.5 : 0) / speed, ease: "easeOut", opacity: { duration: 0.01 / speed, delay: (on ? 0.5 : 0) / speed } }}
      />
      <motion.path
        d="M6 5.5V18.5"
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.16 / speed, delay: (on ? 0 : 0) / speed, ease: "easeOut", opacity: { duration: 0.01 / speed, delay: (on ? 0 : 0) / speed } }}
      />
      <motion.path
        d="M10 5.5V18.5"
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.16 / speed, delay: (on ? 0.12 : 0) / speed, ease: "easeOut", opacity: { duration: 0.01 / speed, delay: (on ? 0.12 : 0) / speed } }}
      />
      <motion.path
        d="M14 5.5V18.5"
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.16 / speed, delay: (on ? 0.24 : 0) / speed, ease: "easeOut", opacity: { duration: 0.01 / speed, delay: (on ? 0.24 : 0) / speed } }}
      />
      <motion.path
        d="M18 5.5V18.5"
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.16 / speed, delay: (on ? 0.36 : 0) / speed, ease: "easeOut", opacity: { duration: 0.01 / speed, delay: (on ? 0.36 : 0) / speed } }}
      />
    </svg>
  );
}
