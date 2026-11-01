"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HashIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A hash whose four bars slide out of line, then snap together into a grid. */
export function HashIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HashIconProps) {
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
        d="M4 9.5h16"
        stroke={accent}
        initial={false}
        animate={on ? { x: [0, 2.2, 0] } : { x: 0 }}
        transition={{ duration: 0.45 / speed, times: [0, 0.6, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M4 14.5h16"
        stroke={accent}
        initial={false}
        animate={on ? { x: [0, -2.2, 0] } : { x: 0 }}
        transition={{ duration: 0.45 / speed, times: [0, 0.6, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M9.5 4v16"
        initial={false}
        animate={on ? { y: [0, -2.2, 0] } : { y: 0 }}
        transition={{ duration: 0.45 / speed, times: [0, 0.6, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M15.5 4v16"
        initial={false}
        animate={on ? { y: [0, 2.2, 0] } : { y: 0 }}
        transition={{ duration: 0.45 / speed, times: [0, 0.6, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
