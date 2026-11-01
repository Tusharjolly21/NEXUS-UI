"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type KeyboardIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A keyboard whose keys are typed in a quick uneven rhythm, ending on a firm space bar. */
export function KeyboardIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: KeyboardIconProps) {
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
      <rect x="2.5" y="6.5" width="19" height="11" rx="2.6" />
      {[
        { x: 6, d: 0.05 },
        { x: 9, d: 0.12 },
        { x: 12, d: 0.2 },
        { x: 15, d: 0.26 },
        { x: 18, d: 0.36 },
      ].map((k) => (
        <motion.path
          key={k.x}
          d={`M${k.x} 10h.01`}
          strokeWidth={2.6}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 0.4, 1] } : { scale: 1 }}
          transition={{ duration: 0.2 / speed, delay: (k.d) / speed }}
        />
      ))}
      <path d="M6 13.8h.01M18 13.8h.01" strokeWidth={2.6} />
      <motion.path
        d="M9.5 13.8h5"
        stroke={accent}
        initial={false}
        animate={on ? { y: [0, 0.8, 0] } : { y: 0 }}
        transition={{ duration: 0.2 / speed, delay: (0.5) / speed }}
      />
    </svg>
  );
}
