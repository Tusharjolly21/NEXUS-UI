"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MotorcycleIconProps = {
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

/** A motorcycle whose front wheel lifts into a short wheelie while both wheels spin, then drops back down. */
export function MotorcycleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MotorcycleIconProps) {
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
      <motion.g
        style={{ originX: "24%", originY: "80%" }}
        initial={false}
        animate={on ? { rotate: [0, -13, -13, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.65, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3.6 10.2H10L12 8.2H14.6L16.4 10.4V13.2H8.6Z" fill="currentColor" strokeWidth={strokeWidth * 0.6} />
        <path d="M15.6 7.4 18.2 15M14.6 5.8H17.8M5.8 15 8.4 12.2" />
        <path d="M10 15H13" stroke={accent} />
        {[5.8, 18.2].map((x) => (
          <g key={x}>
            <circle cx={x} cy="15" r="3.2" />
            <motion.path
              d={`M${x - 1.8} 15h3.6`}
              strokeWidth={strokeWidth * 0.45}
              style={{ originX: "50%", originY: "50%" }}
              initial={false}
              animate={on ? { rotate: [0, 540] } : { rotate: 0 }}
              transition={{ duration: 0.9 / speed, ease: "easeOut" }}
            />
          </g>
        ))}
      </motion.g>
    </svg>
  );
}
