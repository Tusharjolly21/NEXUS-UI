"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CollapseIconProps = {
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

/** Four diagonal arrows pull their heads in towards the centre, shortening their shafts, then spring back out. */
export function CollapseIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CollapseIconProps) {
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
        ["M4.5 9.5H9.5V4.5", 4, 4, 9.5, 9.5, 1, 1],
        ["M19.5 9.5H14.5V4.5", 20, 4, 14.5, 9.5, -1, 1],
        ["M19.5 14.5H14.5V19.5", 20, 20, 14.5, 14.5, -1, -1],
        ["M4.5 14.5H9.5V19.5", 4, 20, 9.5, 14.5, 1, -1],
      ] as [string, number, number, number, number, number, number][]).map(([head, ox, oy, ix, iy, sx, sy]) => (
        <g key={head} stroke={accent}>
          <motion.path
            d={`M${ox} ${oy}L${ix} ${iy}`}
            initial={false}
            animate={on ? { d: [0, 0.9, -0.5, 0].map((k) => `M${ox} ${oy}L${ix + sx * k} ${iy + sy * k}`) } : { d: `M${ox} ${oy}L${ix} ${iy}` }}
            transition={{ duration: 0.75 / speed, times: [0, 0.4, 0.7, 1], ease: "easeInOut" }}
          />
          <motion.path
            d={head}
            initial={false}
            animate={on ? { x: [0, sx * 0.9, sx * -0.5, 0], y: [0, sy * 0.9, sy * -0.5, 0] } : { x: 0, y: 0 }}
            transition={{ duration: 0.75 / speed, times: [0, 0.4, 0.7, 1], ease: "easeInOut" }}
          />
        </g>
      ))}
    </svg>
  );
}
