"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ListChecksIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Three task rows whose ticks draw through their boxes one after another. */
export function ListChecksIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ListChecksIconProps) {
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
      {([
        [4.6, 0],
        [12, 0.25],
        [19.4, 0.5],
      ] as [number, number][]).map(([y, dl]) => (
        <g key={y}>
          <path d={`M5.8 ${y - 2.4}H4.2a1 1 0 0 0-1 1v2.8a1 1 0 0 0 1 1H7a1 1 0 0 0 1-1V${y}`} strokeWidth={1.5} />
          <motion.path
            d={`M4.8 ${y}l1.1 .9 2.8 -3.1`}
            stroke={accent}
            strokeWidth={1.4}
            initial={false}
            animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
            transition={{ duration: 0.3 / speed, delay: (dl) / speed }}
          />
          <path d={`M11.5 ${y}h9`} />
        </g>
      ))}
    </svg>
  );
}
