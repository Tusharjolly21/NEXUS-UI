"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BuildingIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An office tower whose windows light up floor by floor. */
export function BuildingIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BuildingIconProps) {
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
      <rect x="5" y="3" width="14" height="18" rx="1.6" />
      {[
        { x: 9.5, y: 7.5 }, { x: 14.5, y: 7.5 },
        { x: 9.5, y: 11.5 }, { x: 14.5, y: 11.5 },
        { x: 9.5, y: 15.5 }, { x: 14.5, y: 15.5 },
      ].map((w, i) => (
        <motion.path
          key={`${w.x}-${w.y}`}
          d={`M${w.x} ${w.y}h.01`}
          stroke={accent}
          strokeWidth={3}
          initial={false}
          animate={on ? { opacity: [0.2, 1] } : { opacity: 1 }}
          transition={{ duration: 0.25 / speed, delay: (0.05 + i * 0.08) / speed }}
        />
      ))}
      <path d="M10.5 21v-2.2h3V21" />
    </svg>
  );
}
