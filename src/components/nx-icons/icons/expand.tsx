"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ExpandIconProps = {
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

/** Four diagonal arrows push their heads out towards the corners, stretching their shafts, then ease back with a small recoil. */
export function ExpandIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ExpandIconProps) {
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
        ["M4 9V4h5", 4, 4, 9.5, 9.5, -1, -1],
        ["M15 4h5v5", 20, 4, 14.5, 9.5, 1, -1],
        ["M20 15v5h-5", 20, 20, 14.5, 14.5, 1, 1],
        ["M9 20H4v-5", 4, 20, 9.5, 14.5, -1, 1],
      ] as [string, number, number, number, number, number, number][]).map(([head, ox, oy, ix, iy, sx, sy]) => (
        <g key={head} stroke={accent}>
          <motion.path
            d={`M${ox} ${oy}L${ix} ${iy}`}
            initial={false}
            animate={on ? { d: [0, 1.4, -0.4, 0].map((k) => `M${ox + sx * k} ${oy + sy * k}L${ix} ${iy}`) } : { d: `M${ox} ${oy}L${ix} ${iy}` }}
            transition={{ duration: 0.8 / speed, times: [0, 0.4, 0.7, 1], ease: "easeInOut" }}
          />
          <motion.path
            d={head}
            initial={false}
            animate={on ? { x: [0, sx * 1.4, sx * -0.4, 0], y: [0, sy * 1.4, sy * -0.4, 0] } : { x: 0, y: 0 }}
            transition={{ duration: 0.8 / speed, times: [0, 0.4, 0.7, 1], ease: "easeInOut" }}
          />
        </g>
      ))}
    </svg>
  );
}
