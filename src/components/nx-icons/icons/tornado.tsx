"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TornadoIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #8e8e93. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A small storm cloud shivers while the three lines of the funnel beneath it sweep from side to side, the lowest the furthest. */
export function TornadoIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TornadoIconProps) {
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
        d="M8.75 11.65a2.81 2.81 0 0 1 -0.37 -5.55A3.85 3.85 0 0 1 15.85 6.99a2.44 2.44 0 0 1 0.44 4.66z"
        initial={false}
        animate={on ? { x: [0, 0.45, -0.45, 0.25, 0] } : { x: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      />
      {([
        ["M6.4 14.8H17.6", 0.8, 0],
        ["M8.3 17.6H15.7", 1.4, 0.07],
        ["M10.2 20.4H13.8", 2, 0.14],
      ] as [string, number, number][]).map(([d, a, dl]) => (
        <motion.path
          key={d}
          d={d}
          stroke={accent}
          initial={false}
          animate={on ? { x: [0, a, -a, a * 0.6, -a * 0.3, 0] } : { x: 0 }}
          transition={{ duration: 1 / speed, ease: "easeInOut", delay: (on ? dl : 0) / speed }}
        />
      ))}
    </svg>
  );
}
