"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MeteorIconProps = {
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

/** A meteor that streaks off the corner of the box and comes in again from the other, its three flame trails flickering as it settles. */
export function MeteorIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MeteorIconProps) {
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
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.g
          initial={false}
          animate={on ? { x: [0, 22, -22, 0], y: [0, 22, -22, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 1.1 / speed, times: [0, 0.38, 0.39, 1], ease: ["easeIn", "linear", "easeOut"] }}
        >
          <circle cx="15.5" cy="15.5" r="3.8" />
          <path d="M16.3 16.3h.01" stroke={accent} strokeWidth={2.2} />
          {([
            ["M12.81 12.81 4.68 4.68", 0],
            ["M15.81 11.71 9.35 5.25", 0.05],
            ["M11.71 15.81 5.25 9.35", 0.1],
          ] as [string, number][]).map(([d, dl]) => (
            <motion.path
              key={d}
              d={d}
              stroke={accent}
              initial={false}
              animate={on ? { pathLength: [1, 1, 0.55, 1, 0.75, 1], opacity: [1, 1, 0.6, 1, 0.7, 1] } : { pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.1 / speed, times: [0, 0.5, 0.64, 0.78, 0.9, 1], delay: (on ? dl : 0) / speed }}
            />
          ))}
        </motion.g>
      </svg>
    </svg>
  );
}
