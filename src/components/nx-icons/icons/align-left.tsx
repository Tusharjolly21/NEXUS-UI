"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AlignLeftIconProps = {
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

/** Four lines of text that sweep to the left margin one after another, the short lines sliding across from the middle. */
export function AlignLeftIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AlignLeftIconProps) {
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
        d="M4 5.25h16"
        initial={false}
        animate={on ? { pathLength: [0.55, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.45 / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M4 9.75h10"
        stroke={accent}
        initial={false}
        animate={on ? { x: [3.5, -0.6, 0] } : { x: 0 }}
        transition={{ duration: 0.5 / speed, delay: (on ? 0.1 : 0) / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M4 14.25h16"
        initial={false}
        animate={on ? { pathLength: [0.55, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.45 / speed, delay: (on ? 0.2 : 0) / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M4 18.75h10"
        stroke={accent}
        initial={false}
        animate={on ? { x: [3.5, -0.6, 0] } : { x: 0 }}
        transition={{ duration: 0.5 / speed, delay: (on ? 0.3 : 0) / speed, ease: "easeOut" }}
      />
    </svg>
  );
}
