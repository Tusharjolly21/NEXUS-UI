"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BarChartHorizontalIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff9f0a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Four bars that grow sideways from the axis one after another, overshooting a little before settling, the longest in colour. */
export function BarChartHorizontalIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BarChartHorizontalIconProps) {
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
      <path d="M3.5 3v18" />
      {[
        { y: 5.5, to: 19.5 },
        { y: 10, to: 13 },
        { y: 14.5, to: 16.5 },
        { y: 19, to: 9.5 },
      ].map((b, i) => (
        <motion.line
          key={b.y}
          x1="4"
          y1={b.y}
          y2={b.y}
          stroke={i === 0 ? accent : "currentColor"}
          initial={false}
          animate={on ? { x2: [4, b.to + 1.4, b.to] } : { x2: b.to }}
          transition={{ duration: 0.6 / speed, times: [0, 0.7, 1], ease: "easeOut", delay: (on ? i * 0.12 : 0) / speed }}
        />
      ))}
    </svg>
  );
}
