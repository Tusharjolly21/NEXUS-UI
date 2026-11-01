"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MusicIconProps = {
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

/** A pair of notes that bounce to a beat, with a pink note head popping in time. */
export function MusicIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MusicIconProps) {
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
        initial={false}
        animate={on ? { y: [0, -2, 0, -1, 0] } : { y: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <path d="M9.5 17.5V5.5l10-2v12" />
        <circle cx="6.5" cy="17.5" r="3" />
        <motion.circle
          cx="16.5"
          cy="15.5"
          r="3"
          fill={accent}
          initial={false}
          animate={on ? { fillOpacity: [0, 1, 0.4, 1] } : { fillOpacity: 0 }}
          transition={{ duration: 0.8 / speed }}
        />
      </motion.g>
    </svg>
  );
}
