"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CheckIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The tick draws itself in one stroke, then pops while a ring of green sweeps once around it and fades. */
export function CheckIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CheckIconProps) {
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
      <motion.circle
        cx="12"
        cy="12"
        r="11.2"
        transform="rotate(-90 12 12)"
        stroke={accent}
        strokeWidth={strokeWidth * 0.6}
        initial={false}
        animate={on ? { pathLength: [0, 1, 1], opacity: [0, 1, 1, 0] } : { pathLength: 0, opacity: 0 }}
        transition={{ pathLength: { duration: 0.5 / speed, delay: (on ? 0.4 : 0) / speed, ease: "easeOut" }, opacity: { duration: 0.5 / speed, delay: (on ? 0.4 : 0) / speed, times: [0, 0.15, 0.6, 1] } }}
      />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.07, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 / speed, delay: (on ? 0.4 : 0) / speed, times: [0, 0.5, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g transform="translate(0 0)">
          <motion.path
            d="M5.106 12L9.702 16.596L18.894 7.404"
            initial={false}
            animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
            transition={{ duration: 0.35 / speed, delay: (on ? 0.05 : 0) / speed, ease: "easeOut" }}
          />
        </g>
      </motion.g>
    </svg>
  );
}
