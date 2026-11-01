"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MinusIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff3b30. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A bar that splits in two, slides apart with a dot between, and joins back together. */
export function MinusIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MinusIconProps) {
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
        d="M12 12h.01"
        stroke={accent}
        strokeWidth={3.4}
        initial={false}
        animate={on ? { opacity: [0, 1, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.6 / speed, times: [0, 0.3, 0.6, 1] }}
      />
      <motion.path
        d="M5 12h6.5"
        initial={false}
        animate={on ? { x: [0, -2.5, 0] } : { x: 0 }}
        transition={{ duration: 0.6 / speed, times: [0, 0.4, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M12.5 12H19"
        stroke={accent}
        initial={false}
        animate={on ? { x: [0, 2.5, 0] } : { x: 0 }}
        transition={{ duration: 0.6 / speed, times: [0, 0.4, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
