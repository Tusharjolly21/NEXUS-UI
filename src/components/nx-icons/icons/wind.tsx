"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WindIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #64d2ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Three streams of air that rush in one after another and curl at the ends. */
export function WindIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WindIconProps) {
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
        d="M3.5 9h10a2.8 2.8 0 1 0-2.8-2.8"
        initial={false}
        animate={on ? { pathLength: [0, 1], x: [-2, 0] } : { pathLength: 1, x: 0 }}
        transition={{ duration: 0.5 / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M3.5 13h14.5a2.8 2.8 0 1 1-2.8 2.8"
        initial={false}
        animate={on ? { pathLength: [0, 1], x: [-2, 0] } : { pathLength: 1, x: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0.1) / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M3.5 17.2h6.5"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1], x: [-2, 0] } : { pathLength: 1, x: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0.2) / speed, ease: "easeOut" }}
      />
    </svg>
  );
}
