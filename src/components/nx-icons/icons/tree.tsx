"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TreeIconProps = {
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

/** A tree whose canopy sways in the breeze while a single leaf drifts down. */
export function TreeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TreeIconProps) {
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
      <path d="M12 15.8V21" stroke={accent} />
      <motion.g
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { rotate: [0, -3, 3, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <path d="M12 2.8 7 9.6h2.8l-4.6 6.2h13.6l-4.6-6.2H17z" />
      </motion.g>
      <motion.path
        d="M17.6 7h.01"
        stroke={accent}
        strokeWidth={3}
        initial={false}
        animate={on ? { y: [0, 4, 8, 12], x: [0, 1, 0.4, 1.4], opacity: [0, 1, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.8 / speed, delay: (0.25) / speed, ease: "easeIn" }}
      />
    </svg>
  );
}
