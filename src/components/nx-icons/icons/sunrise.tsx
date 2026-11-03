"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SunriseIconProps = {
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

/** A sun that climbs over the horizon while its rays pop out one by one. */
export function SunriseIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SunriseIconProps) {
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
      <g transform="translate(0 -2.0)">
      <path d="M2.5 19h19" />
      <motion.g
        initial={false}
        animate={on ? { y: [5, 0], opacity: [0, 1] } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.6 / speed, ease: "easeOut" }}
      >
        <path d="M7 19a5 5 0 0 1 10 0" />
      </motion.g>
      {["M12 11.7V9", "M7.2 14.1 5.3 12.2", "M16.8 14.1l1.9-1.9"].map((d, i) => (
        <motion.path
          key={d}
          d={d}
          stroke={accent}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [0, 1.3, 1], opacity: [0, 1] } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 / speed, delay: (on ? 0.35 + i * 0.1 : 0) / speed }}
        />
      ))}
      </g>
    </svg>
  );
}
