"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GitBranchIconProps = {
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

/** A branch that grows off the main line, nodes popping as it joins. */
export function GitBranchIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GitBranchIconProps) {
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
        d="M7 7.5v9"
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.35 / speed }}
      />
      <motion.path
        d="M17 11v.5a4.5 4.5 0 0 1-4.5 4.5H7"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.45 / speed, delay: (on ? 0.25 : 0) / speed }}
      />
      {[
        { x: 7, y: 5.5, d: 0 },
        { x: 7, y: 18.5, d: 0.12 },
        { x: 17, y: 9, d: 0.45 },
      ].map((n) => (
        <motion.circle
          key={n.d}
          cx={n.x}
          cy={n.y}
          r="2"
          stroke={n.d === 0.45 ? accent : "currentColor"}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1.35, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 / speed, delay: (n.d) / speed }}
        />
      ))}
    </svg>
  );
}
