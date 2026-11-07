"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CassetteTapeIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff453a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A cassette whose two reels turn once while the tape strip between them winds along. */
export function CassetteTapeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CassetteTapeIconProps) {
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
      <rect x="2.5" y="4" width="19" height="16" rx="2.5" />
      <path d="M8 20 9.4 17.6H14.6L16 20" />
      <motion.path
        d="M7.8 14.9H16.2"
        stroke={accent}
        strokeWidth={1.2}
        initial={false}
        animate={on ? { x: [0, -1.4, 1.4, 0] } : { x: 0 }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      />
      <circle cx="7.8" cy="10" r="2.5" />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 360] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      >
        <rect x="5.3" y="7.5" width="5" height="5" fill="none" stroke="none" />
        <path d="M7.8 10L7.8 9M7.8 10L8.67 10.5M7.8 10L6.93 10.5" stroke={accent} strokeWidth={1.2} />
      </motion.g>
      <circle cx="16.2" cy="10" r="2.5" />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 360] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      >
        <rect x="13.7" y="7.5" width="5" height="5" fill="none" stroke="none" />
        <path d="M16.2 10L16.2 9M16.2 10L17.07 10.5M16.2 10L15.33 10.5" stroke={accent} strokeWidth={1.2} />
      </motion.g>
    </svg>
  );
}
