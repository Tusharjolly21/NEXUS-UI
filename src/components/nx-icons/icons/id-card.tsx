"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type IdCardIconProps = {
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

/** An identity card that lifts and tilts while its three detail lines are written in one after another. */
export function IdCardIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: IdCardIconProps) {
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
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { y: [0, -1.4, 0], rotate: [0, -3, 0] } : { y: 0, rotate: 0 }} transition={{ duration: 0.6 / speed, times: [0, 0.35, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M6 5H18A3 3 0 0 1 21 8V16A3 3 0 0 1 18 19H6A3 3 0 0 1 3 16V8A3 3 0 0 1 6 5Z"  />
      <circle cx="8.7" cy="9.4" r="2" fill="currentColor" stroke="none" />
      <path d="M6.2 16.2a2.5 2.5 0 0 1 5 0"  />
      <motion.g style={{ originX: "57.5%", originY: "37.5%" }} initial={false} animate={on ? { scaleX: [1, 0.02, 1], opacity: [1, 0, 1] } : { scaleX: 1, opacity: 1 }} transition={{ duration: 0.35 / speed, times: [0, 0.35, 1], ease: "easeOut", delay: (0.18) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M13.8 9L18 9" stroke={accent} />
      </motion.g>
      <motion.g style={{ originX: "57.5%", originY: "50%" }} initial={false} animate={on ? { scaleX: [1, 0.02, 1], opacity: [1, 0, 1] } : { scaleX: 1, opacity: 1 }} transition={{ duration: 0.35 / speed, times: [0, 0.35, 1], ease: "easeOut", delay: (0.28) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M13.8 12L18 12" stroke={accent} />
      </motion.g>
      <motion.g style={{ originX: "57.5%", originY: "62.5%" }} initial={false} animate={on ? { scaleX: [1, 0.02, 1], opacity: [1, 0, 1] } : { scaleX: 1, opacity: 1 }} transition={{ duration: 0.35 / speed, times: [0, 0.35, 1], ease: "easeOut", delay: (0.38) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M13.8 15L15.6 15" stroke={accent} />
      </motion.g>
      </motion.g>
    </svg>
  );
}
