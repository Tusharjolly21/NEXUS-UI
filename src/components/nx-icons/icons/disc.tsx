"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type DiscIconProps = {
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

/** A disc that spins up fast, its two highlight arcs whirling, then winds down to a stop while the hub pulses. */
export function DiscIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: DiscIconProps) {
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
        r="9"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 720] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, ease: [0.3, 0.1, 0.2, 1] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12.97 6.49A5.6 5.6 0 0 1 17.52 11.03" stroke={accent} />
        <path d="M11.03 17.51A5.6 5.6 0 0 1 6.48 12.97" stroke={accent} />
      </motion.g>
      <motion.circle
        cx="12"
        cy="12"
        r="1.4"
        initial={false}
        animate={on ? { scale: [1, 1.5, 1, 1.3, 1] } : { scale: 1 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
