"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RewindIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Two left-pointing triangles that scroll backwards along the tape, one leaving and a fresh one arriving, with a glow that pulses through them. */
export function RewindIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RewindIconProps) {
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
        animate={on ? { x: [0, -9.6, 0, 0] } : { x: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.78, 0.781, 1], ease: "easeInOut" }}
      >
        {([
          [0, accent, [1, 0.5, 0, 1, 1]],
          [1, "currentColor", [1, 0.6, 0, 1, 1]],
          [1, accent, [0, 0.4, 1, 0, 0]],
          [2, "currentColor", [0, 0, 1, 0, 0]],
        ] as [number, string, number[]][]).map(([i, c, op], k) => (
          <motion.path
            key={k}
            d={`M${10.7 + i * 9.6} 6.8 ${3.7 + i * 9.6} 12l7 5.2z`}
            stroke={c}
            fill={accent}
            initial={false}
            animate={on ? { opacity: op, fillOpacity: [0, 0.3, 0.1, 0, 0] } : { opacity: op[0], fillOpacity: 0 }}
            transition={{
              opacity: { duration: 0.8 / speed, times: [0, 0.35, 0.78, 0.781, 1], ease: "linear" },
              fillOpacity: { duration: 0.8 / speed, times: [0, 0.35, 0.7, 0.781, 1], ease: "easeOut" },
            }}
          />
        ))}
      </motion.g>
      </svg>
    </svg>
  );
}
