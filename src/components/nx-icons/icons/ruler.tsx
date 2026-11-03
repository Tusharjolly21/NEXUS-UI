"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RulerIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #a2845e. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A diagonal ruler whose four tick marks draw one after another along its edge, then it gives a small shiver. */
export function RulerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RulerIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 0, -3.5, 2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.95 / speed, times: [0, 0.5, 0.65, 0.82, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g transform="rotate(-45 12 12)">
          {[0, 1, 2, 3].map((i) => (
            <motion.path
              key={i}
              d={`M${5.7 + i * 4.2} 8v${i % 2 === 0 ? 4 : 2.6}`}
              stroke={accent}
              strokeWidth={1.8}
              initial={false}
              animate={on ? { pathLength: [0.02, 1] } : { pathLength: 1 }}
              transition={{ duration: 0.2 / speed, delay: (0.08 + i * 0.14) / speed, ease: "easeOut" }}
            />
          ))}
          <rect x="2.4" y="8" width="19.2" height="8" rx="1.8" />
        </g>
      </motion.g>
    </svg>
  );
}
