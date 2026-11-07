"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TrafficSignalIconProps = {
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

/** A traffic light whose lamps glow in turn, red then amber then green, each with a soft halo. */
export function TrafficSignalIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TrafficSignalIconProps) {
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
      <rect x="7" y="3" width="10" height="13.5" rx="2.5" />
      <path d="M12 16.5V21M9 21H15" />
      {([[6, "#ff453a", [0, 1, 1, 0, 0, 0, 0, 0], 0], [9.75, "#ff9f0a", [0, 0, 0, 1, 1, 0, 0, 0], 0], [13.5, accent, [1, 0, 0, 0, 0, 0, 1, 1], 1]] as [number, string, number[], number][]).map(([y, col, op, rest]) => (
        <g key={y}>
          <circle cx="12" cy={y} r="1.4" fill="currentColor" stroke="none" opacity={0.28} />
          <motion.circle
            cx="12"
            cy={y}
            r="3"
            fill={col}
            stroke="none"
            initial={false}
            animate={on ? { opacity: op.map((v) => v * 0.28) } : { opacity: rest * 0.28 }}
            transition={{ duration: 1.2 / speed, times: [0, 0.08, 0.2, 0.32, 0.45, 0.57, 0.72, 1], ease: "easeInOut" }}
          />
          <motion.circle
            cx="12"
            cy={y}
            r="1.4"
            fill={col}
            stroke="none"
            initial={false}
            animate={on ? { opacity: op } : { opacity: rest }}
            transition={{ duration: 1.2 / speed, times: [0, 0.08, 0.2, 0.32, 0.45, 0.57, 0.72, 1], ease: "easeInOut" }}
          />
        </g>
      ))}
    </svg>
  );
}
