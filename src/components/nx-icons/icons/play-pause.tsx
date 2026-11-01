"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PlayPauseIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A play triangle that morphs into pause bars on a spring, with a ring that pulses out. */
export function PlayPauseIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PlayPauseIconProps) {
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
        r="9.6"
        stroke={accent}
        initial={false}
        animate={on ? { scale: [0.7, 1.1], opacity: [0.8, 0] } : { opacity: 0, scale: 0.7 }}
        transition={on ? { duration: 0.5 / speed, ease: "easeOut" } : { duration: 0.1 / speed }}
      />
      <motion.path
        fill="currentColor"
        strokeWidth={1.6}
        initial={false}
        animate={{ d: on ? "M6.5 5 L10 5 L10 19 L6.5 19 Z M14 5 L17.5 5 L17.5 19 L14 19 Z" : "M7 5 L12.5 8.4 L12.5 15.6 L7 19 Z M12.5 8.4 L18.5 12 L18.5 12 L12.5 15.6 Z" }}
        transition={{ type: "spring", stiffness: 300 * speed * speed, damping: 26 * speed }}
      />
    </svg>
  );
}
