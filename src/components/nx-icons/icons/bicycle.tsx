"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BicycleIconProps = {
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

/** A bicycle whose wheels spin up as it rolls forward and rings its bell. */
export function BicycleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BicycleIconProps) {
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
        initial={false}
        animate={on ? { x: [0, 2, 0] } : { x: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <path d="M6 16.5 10.3 9.8M11.5 16.5 10.3 9.8M10.3 9.8h5.3M11.5 16.5l4.1-6.7M15.6 9.8 18 16.5M6 16.5h5.5M15.6 9.8l-1.2-2.2h2.6M8.9 7.6h2.8" stroke={accent} />
        {[6, 18].map((x) => (
          <g key={x}>
            <circle cx={x} cy="16.5" r="3.6" />
            <motion.path
              d={`M${x} 14.4v4.2M${x - 2.1} 16.5h4.2`}
              strokeWidth={strokeWidth * 0.5}
              style={{ originX: "50%", originY: "50%" }}
              initial={false}
              animate={on ? { rotate: [0, 270] } : { rotate: 0 }}
              transition={{ duration: 0.8 / speed, ease: "easeOut" }}
            />
          </g>
        ))}
      </motion.g>
    </svg>
  );
}
