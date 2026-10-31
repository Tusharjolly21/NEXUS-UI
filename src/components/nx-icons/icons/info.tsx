"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type InfoIconProps = {
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

/** An info circle whose dot drops in and bounces while the stem draws itself. */
export function InfoIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: InfoIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
        initial={false}
        animate={on ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.4 / speed, ease: "easeOut" }}
      />
      <motion.circle
        cx="12"
        cy="7.9"
        r="1.15"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { y: [-7, 0], opacity: [0, 1] } : { y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 420 * speed * speed, damping: 12 * speed, delay: (on ? 0.08 : 0) / speed }}
      />
      <motion.path
        d="M12 11.2v5.2"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.3 / speed, delay: (on ? 0.25 : 0) / speed }}
      />
    </svg>
  );
}
