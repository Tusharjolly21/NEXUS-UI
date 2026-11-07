"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FilmSlateIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffd60a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A clapperboard whose striped clapper lifts, snaps shut with a clack, and springs back open. */
export function FilmSlateIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FilmSlateIconProps) {
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
      <rect x="3.25" y="9.9" width="18" height="11" rx="1.5" />
      <path d="M7 13.3H17M7 16.8H12.5" stroke={accent} strokeWidth={1.6} />
      <motion.g
        style={{ originX: "13.54%", originY: "41.25%" }}
        initial={false}
        animate={on ? { rotate: [-9, -15, 1.5, -2.5, -9] } : { rotate: -9 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.38, 0.5, 0.62, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <rect x="3.25" y="5.7" width="18" height="4.2" rx="1" />
        <path d="M6 9.9L9 5.7M10.5 9.9L13.5 5.7M15 9.9L18 5.7" stroke={accent} />
      </motion.g>
    </svg>
  );
}
