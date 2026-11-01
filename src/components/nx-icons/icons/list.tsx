"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ListIconProps = {
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

/** Three list rows whose lines shrink and slide back in turn, the bullets popping. */
export function ListIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ListIconProps) {
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
      {[6, 12, 18].map((y, i) => (
        <g key={y}>
          <motion.path
            d={`M4 ${y}h.01`}
            stroke={accent}
            strokeWidth={3}
            initial={false}
            animate={on ? { scale: [1, 1.6, 1] } : { scale: 1 }}
            style={{ originX: "50%", originY: "50%" }}
            transition={{ duration: 0.35 / speed, delay: (i * 0.1) / speed }}
          />
          <motion.path
            d={`M9 ${y}h11`}
            style={{ originX: "0%", originY: "50%" }}
            initial={false}
            animate={on ? { scaleX: [1, 0.4, 1] } : { scaleX: 1 }}
            transition={{ duration: 0.5 / speed, delay: (i * 0.1) / speed, ease: "easeInOut" }}
          />
        </g>
      ))}
    </svg>
  );
}
