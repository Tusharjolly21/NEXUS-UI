"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PieChartIconProps = {
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

/** A pie chart whose coloured slice pops out of the circle and settles back. */
export function PieChartIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PieChartIconProps) {
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
      <motion.path
        d="M12 12V3a9 9 0 0 1 7.8 4.5z"
        stroke={accent}
        fill={accent}
        fillOpacity={0.2}
        initial={false}
        animate={on ? { x: [0, 0.9, 0], y: [0, -1.6, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.6 / speed, times: [0, 0.4, 1], ease: "easeInOut" }}
      />
      <path d="M12 3V12L19.8 7.5A9 9 0 1 1 12 3z" />
      <path d="M12 12l-7.8 4.5" />
    </svg>
  );
}
