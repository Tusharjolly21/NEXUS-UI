"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SirenIconProps = {
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

/** The dome of an emergency light flashes while its rays pulse outward, left side and right side in turn. */
export function SirenIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SirenIconProps) {
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
        d="M7 15a5 5 0 0 1 10 0z"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { opacity: [0, 0.9, 0, 0.9, 0, 0.9, 0, 0.9, 0] } : { opacity: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.12, 0.25, 0.37, 0.5, 0.62, 0.75, 0.87, 1] }}
      />
      <path d="M7 15a5 5 0 0 1 10 0" />
      <rect x="4.5" y="15" width="15" height="4" rx="1" />
      {([
        [7.42, 8.69, 6.24, 7.07, -0.588, -0.809, 0],
        [4.58, 12.59, 2.68, 11.97, -0.951, -0.309, 0],
        [16.58, 8.69, 17.76, 7.07, 0.588, -0.809, 1],
        [19.42, 12.59, 21.32, 11.97, 0.951, -0.309, 1],
      ] as number[][]).map(([x1, y1, x2, y2, ux, uy, side]) => (
        <motion.path
          key={x1}
          d={`M${x1} ${y1}L${x2} ${y2}`}
          stroke={accent}
          initial={false}
          animate={on
            ? {
                x: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => ((side === 0 ? i === 1 || i === 5 : i === 3 || i === 7) ? ux * 1.2 : 0)),
                y: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => ((side === 0 ? i === 1 || i === 5 : i === 3 || i === 7) ? uy * 1.2 : 0)),
                opacity: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => ((side === 0 ? i === 1 || i === 5 : i === 3 || i === 7) ? 0.3 : 1)),
              }
            : { x: 0, y: 0, opacity: 1 }}
          transition={{ duration: 1 / speed, times: [0, 0.12, 0.25, 0.37, 0.5, 0.62, 0.75, 0.87, 1] }}
        />
      ))}
      <motion.path
        d="M12 7.2V5.2"
        stroke={accent}
        initial={false}
        animate={on ? { y: [0, -1.2, 0, -1.2, 0, -1.2, 0, -1.2, 0], opacity: [1, 0.3, 1, 0.3, 1, 0.3, 1, 0.3, 1] } : { y: 0, opacity: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.12, 0.25, 0.37, 0.5, 0.62, 0.75, 0.87, 1] }}
      />
    </svg>
  );
}
