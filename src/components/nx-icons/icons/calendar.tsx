"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CalendarIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff3b30. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A calendar whose rings click, whose days light up in turn and whose today dot pops in red. */
export function CalendarIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CalendarIconProps) {
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
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17" />
      {[8, 16].map((x, i) => (
        <motion.path
          key={x}
          d={`M${x} 3.4v3.4`}
          initial={false}
          animate={on ? { y: [0, -1.4, 0] } : { y: 0 }}
          transition={{ duration: 0.3 / speed, delay: (on ? i * 0.07 : 0) / speed }}
        />
      ))}
      {[[8, 14], [12, 14], [16, 14], [8, 17.5], [12, 17.5]].map(([x, y], i) => (
        <motion.circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r="0.95"
          fill="currentColor"
          stroke="none"
          initial={false}
          animate={on ? { opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] } : { opacity: 0.4, scale: 1 }}
          transition={{ duration: 0.3 / speed, delay: (on ? 0.1 + i * 0.1 : 0) / speed }}
        />
      ))}
      <motion.circle
        cx="16"
        cy="17.5"
        r="1.7"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { scale: [0, 1.5, 1] } : { scale: 0.7 }}
        transition={on ? { duration: 0.4 / speed, delay: (0.5) / speed } : { duration: 0.15 / speed }}
      />
    </svg>
  );
}
