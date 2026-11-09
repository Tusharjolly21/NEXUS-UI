"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RouterIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A router whose three port lights blink in sequence before its signal arcs pulse outward. */
export function RouterIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RouterIconProps) {
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
      <g transform="translate(0 -0.5)">
      <rect x="2.5" y="14.5" width="19" height="6.5" rx="2" />
      <path d="M4.5 14.5V4M19.5 14.5V4" />
      <path d="M12 11.5h.01" />
      <motion.path
        d="M9.88 9.38a3 3 0 0 1 4.24 0"
        initial={false}
        animate={on ? { opacity: [1, 0.15, 1] } : { opacity: 1 }}
        transition={{ duration: 0.35 / speed, delay: (on ? 0.55 : 0) / speed }}
      />
      <motion.path
        d="M7.76 7.26a6 6 0 0 1 8.48 0"
        initial={false}
        animate={on ? { opacity: [1, 0.15, 1] } : { opacity: 1 }}
        transition={{ duration: 0.35 / speed, delay: (on ? 0.7 : 0) / speed }}
      />
      {([[7.5, 0], [12, 0.16], [16.5, 0.32]] as [number, number][]).map(([x, d]) => (
        <motion.path
          key={x}
          d={`M${x} 17.75h.01`}
          stroke={accent}
          strokeWidth={2.4}
          initial={false}
          animate={on ? { opacity: [1, 0.1, 1] } : { opacity: 1 }}
          transition={{ duration: 0.3 / speed, delay: (on ? d : 0) / speed }}
        />
      ))}
      </g>
    </svg>
  );
}
