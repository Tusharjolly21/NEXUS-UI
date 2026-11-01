"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AtomIconProps = {
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

/** An atom whose three orbits spin round a pulsing nucleus. */
export function AtomIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AtomIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 60] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <ellipse cx="12" cy="12" rx="10" ry="4" strokeWidth={strokeWidth * 0.8} />
        <ellipse cx="12" cy="12" rx="10" ry="4" strokeWidth={strokeWidth * 0.8} transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" strokeWidth={strokeWidth * 0.8} transform="rotate(120 12 12)" />
      </motion.g>
      <motion.circle
        cx="12"
        cy="12"
        r="1.8"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { scale: [1, 1.6, 1, 1.4, 1] } : { scale: 1 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.9 / speed }}
      />
    </svg>
  );
}
