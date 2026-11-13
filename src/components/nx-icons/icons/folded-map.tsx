"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FoldedMapIconProps = {
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

/** A folded map whose route draws itself across the panels and ends with a pulsing destination dot. */
export function FoldedMapIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FoldedMapIconProps) {
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
        cx="18"
        cy="10"
        r="2"
        stroke={accent}
        strokeWidth={1.2}
        initial={false}
        animate={on ? { scale: [0.5, 0.8, 1.15], opacity: [0, 0.9, 0] } : { opacity: 0 }}
        transition={{ duration: 0.4 / speed, delay: (on ? 0.66 : 0) / speed, ease: "easeOut", times: [0, 0.15, 1] }}
      />
      <motion.path
        d="M6.4 14.6C8.6 14.6 9.4 11.8 12 12.1C14.6 12.4 15.2 10 18 10"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.6 / speed, delay: (on ? 0.08 : 0) / speed, ease: "easeInOut" }}
      />
      <motion.circle
        cx="18"
        cy="10"
        r="1.3"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { scale: [0, 1.6, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 / speed, delay: (on ? 0.62 : 0) / speed, ease: "easeOut" }}
      />
      <path d="M3 6.5L9 4.5L15 6.5L21 4.5L21 17.5L15 19.5L9 17.5L3 19.5Z" />
      <path d="M9 4.5V17.5" />
      <path d="M15 6.5V19.5" />
    </svg>
  );
}
