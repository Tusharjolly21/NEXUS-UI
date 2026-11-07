"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CheeseIconProps = {
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

/** A wedge of cheese that tips with a small wobble while its holes swell in turn. */
export function CheeseIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CheeseIconProps) {
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
      <g transform="translate(-0.25 0.25)">
      <motion.g
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { rotate: [0, -4, 3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3.4 19.4V17.6L19.7 4.2a1 1 0 0 1 1.6.8v13.6a.9.9 0 0 1-.9.9H4.3a.9.9 0 0 1-.9-.9z" />
        {[
          { x: 16.4, y: 13.6, r: 1.8, d: 0 },
          { x: 13.6, y: 17.0, r: 0.85, d: 0.1 },
          { x: 18.3, y: 17.4, r: 0.95, d: 0.2 },
        ].map((h) => (
          <motion.circle
            key={h.x}
            cx={h.x}
            cy={h.y}
            r={h.r}
            fill={accent}
            stroke="none"
            style={{ originX: "50%", originY: "50%" }}
            initial={false}
            animate={on ? { scale: [1, 1.45, 1] } : { scale: 1 }}
            transition={{ duration: 0.4 / speed, delay: (h.d + 0.1) / speed }}
          />
        ))}
      </motion.g>
      </g>
    </svg>
  );
}
