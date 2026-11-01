"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SmileIconProps = {
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

/** A face that blinks and then breaks into a wider smile. */
export function SmileIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SmileIconProps) {
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
      <circle cx="12" cy="12" r="9" />
      {[9, 15].map((x) => (
        <motion.circle
          key={x}
          cx={x}
          cy="9.6"
          r="1.15"
          fill="currentColor"
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scaleY: [1, 0.12, 1] } : { scaleY: 1 }}
          transition={{ duration: 0.3 / speed, delay: (0.1) / speed }}
        />
      ))}
      <motion.path
        d="M8 14a5 5 0 0 0 8 0"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleX: [1, 0.8, 1.2, 1], y: [0, 0, 0.6, 0] } : { scaleX: 1, y: 0 }}
        transition={{ duration: 0.6 / speed, delay: (0.2) / speed, times: [0, 0.3, 0.7, 1] }}
      />
    </svg>
  );
}
