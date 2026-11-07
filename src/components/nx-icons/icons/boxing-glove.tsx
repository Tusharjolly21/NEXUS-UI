"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BoxingGloveIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff3b30. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A boxing glove that pulls back, punches upward with a burst of impact lines and snaps back. */
export function BoxingGloveIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BoxingGloveIconProps) {
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
        animate={on ? { y: [0, 1.5, -1.8, -1.8, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.45, 0.6, 1], ease: "easeInOut" }}
      >
        <path d="M8 14.5V9.6C8 6 10.2 4 13.75 4S19.5 6 19.5 9.6v4.9" />
        <rect x="8.75" y="14.5" width="10" height="5.25" rx="1" />
        <path d="M8.75 17.1h10" stroke={accent} strokeWidth={1.2} />
        <path d="M8 9.8H6.4a2.15 2.15 0 0 0-2.15 2.15v.35A3.2 3.2 0 0 0 7.45 14.5H8" />
      </motion.g>
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        {(["M6.4 5.4 4.8 3.8", "M3 8 4.4 8", "M21 5.4 22.6 3.8", "M23 8 21.6 8"] as string[]).map((p, i) => (
          <motion.path
            key={p}
            d={p}
            stroke={accent}
            strokeWidth={1.4}
            initial={false}
            animate={on ? { pathLength: [0, 1, 1], opacity: [0, 1, 0] } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.4 / speed, delay: (0.36 + (i % 2) * 0.04) / speed }}
          />
        ))}
      </svg>
    </svg>
  );
}
