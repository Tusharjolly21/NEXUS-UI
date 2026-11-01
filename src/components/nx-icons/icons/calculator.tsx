"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CalculatorIconProps = {
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

/** A calculator whose keys press one after another and whose screen flickers. */
export function CalculatorIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CalculatorIconProps) {
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
      <rect x="5" y="2.5" width="14" height="19" rx="2.6" />
      <motion.rect
        x="8"
        y="5.5"
        width="8"
        height="3.4"
        rx="0.8"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [1, 0.4, 1, 0.5, 1] } : { opacity: 1 }}
        transition={{ duration: 0.6 / speed }}
      />
      {[9, 12, 15].flatMap((x, c) => [13, 17].map((y, r) => ({ x, y, i: c + r * 3 }))).map((k) => (
        <motion.path
          key={`${k.x}-${k.y}`}
          d={`M${k.x} ${k.y}h.01`}
          strokeWidth={2.8}
          stroke={k.i === 5 ? accent : "currentColor"}
          initial={false}
          animate={on ? { scale: [1, 0.4, 1] } : { scale: 1 }}
          style={{ originX: "50%", originY: "50%" }}
          transition={{ duration: 0.25 / speed, delay: (0.05 + k.i * 0.08) / speed }}
        />
      ))}
    </svg>
  );
}
