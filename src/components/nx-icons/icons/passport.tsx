"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PassportIconProps = {
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

/** A passport whose crest star turns a fifth of a turn before the stamp line is written. */
export function PassportIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PassportIconProps) {
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
      <rect x="5.5" y="2.5" width="13" height="19" rx="2" />
      <motion.g
        style={{ originX: "50%", originY: "42.5%" }}
        initial={false}
        animate={on ? { rotate: [0, 72] } : { rotate: 0, transition: { duration: 0 / speed } }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 7.7L12.62 9.35L14.38 9.43L13 10.52L13.47 12.22L12 11.25L10.53 12.22L11 10.52L9.62 9.43L11.38 9.35Z" fill={accent} stroke="none" />
      </motion.g>
      <circle cx="12" cy="10.2" r="4.2" />
      <motion.path
        d="M8.8 17.8H15.2"
        initial={false}
        animate={on ? { pathLength: [1, 0.001, 1], opacity: [1, 0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5 / speed, delay: (on ? 0.55 : 0) / speed, ease: "easeOut", times: [0, 0.3, 1] }}
      />
    </svg>
  );
}
