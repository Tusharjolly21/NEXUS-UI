"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FlaskIconProps = {
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

/** A flask whose liquid sloshes while bubbles rise and pop. */
export function FlaskIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FlaskIconProps) {
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
      <path d="M9 3h6M10 3v6.2L4.6 18.4a2 2 0 0 0 1.7 3h11.4a2 2 0 0 0 1.7-3L14 9.2V3" />
      <motion.path
        d="M8 16h8"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleX: [1, 0.85, 1, 0.92, 1], y: [0, 0.6, 0, 0.3, 0] } : { scaleX: 1, y: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      />
      {[
        { x: 10.8, y: 13.4, d: 0 },
        { x: 13.6, y: 12.8, d: 0.2 },
        { x: 12.2, y: 14.4, d: 0.4 },
      ].map((b) => (
        <motion.circle
          key={b.d}
          cx={b.x}
          cy={b.y}
          r="0.9"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { y: [0, -4.5], opacity: [0, 1, 0] } : { opacity: 0 }}
          transition={{ duration: 0.5 / speed, delay: (b.d) / speed }}
        />
      ))}
    </svg>
  );
}
