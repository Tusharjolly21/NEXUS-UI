"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LampIconProps = {
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

/** A desk lamp that is switched on: its rays fan out and flicker to a warm glow. */
export function LampIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LampIconProps) {
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
      <g transform="translate(0 -1.0)">
      <path d="M7.5 5h9l2.5 8H5z" />
      <path d="M12 13v7.5M8 21h8" />
      {[
        "M5.2 15.8l-1.4 1.5",
        "M8.8 16.4l-.8 2",
        "M15.2 16.4l.8 2",
        "M18.8 15.8l1.4 1.5",
      ].map((d, i) => (
        <motion.path
          key={d}
          d={d}
          stroke={accent}
          style={{ originX: "50%", originY: "0%" }}
          initial={false}
          animate={on ? { scale: [0.3, 1.25, 1], opacity: [0, 1, 0.3, 1, 0.7, 1] } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 / speed, delay: (on ? 0.15 + i * 0.05 : 0) / speed }}
        />
      ))}
      </g>
    </svg>
  );
}
