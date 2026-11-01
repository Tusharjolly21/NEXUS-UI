"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type DropletIconProps = {
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

/** A water drop that falls away, splashes a ripple, and drips back in from above. */
export function DropletIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: DropletIconProps) {
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
      <motion.ellipse
        cx="12"
        cy="21"
        rx="4"
        ry="1.1"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [0.3, 1.5], opacity: [0, 0.9, 0] } : { opacity: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0.4) / speed }}
      />
      <motion.g
        initial={false}
        animate={on ? { y: [0, 9, -7, 0], opacity: [1, 0, 0, 1] } : { y: 0, opacity: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.4, 0.41, 0.85], ease: "easeInOut" }}
      >
        <path d="M9.2 14.8a2.9 2.9 0 0 0 2.3 2.5" stroke={accent} />
        <path d="M12 3.5C9 8 6 11 6 14.5a6 6 0 0 0 12 0C18 11 15 8 12 3.5z" />
      </motion.g>
    </svg>
  );
}
