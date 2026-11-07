"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChartScatterIconProps = {
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

/** A scatter plot whose five dots pop in one after another before the trend line draws itself through them. */
export function ChartScatterIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ChartScatterIconProps) {
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
      <path d="M3.5 3.5V20.5H20.5" />
      {([[7.5, 12.2, 0.03], [11.5, 8.5, 0.14], [13, 17.3, 0.25], [17, 13.2, 0.36], [15.5, 5.4, 0.47]] as [number, number, number][]).map(([x, y, s]) => (
        <motion.circle
          key={x + "-" + y}
          cx={x}
          cy={y}
          r="1.15"
          fill="currentColor"
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [0, 0, 1.45, 1, 1] } : { scale: 1 }}
          transition={on ? { duration: 1.3 / speed, times: [0, s, s + 0.1, s + 0.2, 1], ease: "easeOut" } : { duration: 0.15 / speed }}
        />
      ))}
      <motion.path
        d="M6.5 16.9 19.5 7.1"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 0, 1, 1], opacity: [0, 0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={on ? { pathLength: { duration: 1.3 / speed, times: [0, 0.62, 0.92, 1], ease: "easeInOut" }, opacity: { duration: 1.3 / speed, times: [0, 0.62, 0.63, 1] } } : { duration: 0.2 / speed }}
      />
    </svg>
  );
}
