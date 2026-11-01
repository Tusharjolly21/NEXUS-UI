"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LightbulbIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffd60a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A light bulb that flickers on, glowing yellow with rays of light around it. */
export function LightbulbIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LightbulbIconProps) {
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
        d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.1 1 1.9v.8h5.2v-.8c0-.8.4-1.4 1-1.9A6 6 0 0 0 12 3z"
        fill={accent}
        initial={false}
        animate={on ? { fillOpacity: [0, 0.6, 0.2, 0.85] } : { fillOpacity: 0 }}
        transition={{ duration: 0.8 / speed }}
      />
      <path d="M9.8 18.6h4.4M10.6 21h2.8" />
      <motion.path
        d="M10.4 10.2 12 12l1.6-1.8"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0.3, 1, 0.5, 1] } : { opacity: 0.4 }}
        transition={{ duration: 0.8 / speed }}
      />
      <motion.path
        d="M4.4 4.8l1.3 1.3M19.6 4.8l-1.3 1.3M2.4 10.4h1.8M19.8 10.4h1.8"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 0, 1], scale: [0.6, 0.6, 1] } : { opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.3, 1] }}
      />
    </svg>
  );
}
