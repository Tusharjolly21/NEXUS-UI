"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BarChartIconProps = {
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

/** Three bars that grow up from the baseline one after another, the tallest in colour. */
export function BarChartIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BarChartIconProps) {
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
      <path d="M3.5 20.5h17" />
      {[
        { x: 6.5, to: 13 },
        { x: 12, to: 6 },
        { x: 17.5, to: 10 },
      ].map((b, i) => (
        <motion.path
          key={b.x}
          d={`M${b.x} 20V${b.to}`}
          stroke={i === 1 ? accent : "currentColor"}
          style={{ originX: "50%", originY: "100%" }}
          initial={false}
          animate={on ? { scaleY: [0.15, 1.15, 1] } : { scaleY: 1 }}
          transition={{ duration: 0.6 / speed, times: [0, 0.7, 1], ease: "easeOut", delay: (i * 0.12) / speed }}
        />
      ))}
    </svg>
  );
}
