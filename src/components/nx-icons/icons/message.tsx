"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MessageIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A chat bubble that pops open and shows three typing dots bouncing in turn. */
export function MessageIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MessageIconProps) {
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
        d="M4.2 5.2h15.6a1.6 1.6 0 0 1 1.6 1.6v8.6a1.6 1.6 0 0 1-1.6 1.6H11.2L6.6 20.2v-3.2H4.2a1.6 1.6 0 0 1-1.6-1.6V6.8a1.6 1.6 0 0 1 1.6-1.6z"
        style={{ originX: "30%", originY: "80%" }}
        initial={false}
        animate={on ? { scale: [1, 1.09, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 / speed, ease: "easeOut" }}
      />
      {[8, 12, 16].map((x, i) => (
        <motion.circle
          key={x}
          cx={x}
          cy="11"
          r="1.15"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { scale: [0, 1.25, 1, 1, 1], y: [0, 0, 0, -1.8, 0] } : { scale: 1, y: 0 }}
          transition={on ? { duration: 1 / speed, times: [0, 0.2, 0.35, 0.6, 0.8], delay: (i * 0.1) / speed } : { duration: 0.15 / speed }}
        />
      ))}
    </svg>
  );
}
