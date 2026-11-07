"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FlyingSaucerIconProps = {
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

/** A flying saucer that hovers and tilts while its rim lights chase round and the beam pulses. */
export function FlyingSaucerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FlyingSaucerIconProps) {
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
        style={{ originX: "50%", originY: "46%" }}
        initial={false}
        animate={on ? { rotate: [0, -6, 5, -3, 0], y: [0, -1.2, 0.6, -0.6, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 1.1 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M8.5 13.97L5.5 20M15.5 13.97L18.5 20"
          stroke={accent}
          strokeWidth={1.6}
          initial={false}
          animate={on ? { opacity: [1, 0.15, 1, 0.3, 1] } : { opacity: 1 }}
          transition={{ duration: 1.1 / speed }}
        />
        <path d="M7.5 8.18 A4.5 4.5 0 0 1 16.5 8.18 A9.5 3.2 0 0 1 21.5 11 A9.5 3.2 0 0 1 2.5 11 A9.5 3.2 0 0 1 7.5 8.18Z" />
        {([[6, 0], [9, 1], [12, 2], [15, 3], [18, 4]] as [number, number][]).map(([x, i]) => (
          <motion.circle
            key={x}
            cx={x}
            cy="11.2"
            r="0.8"
            fill={accent}
            stroke="none"
            initial={false}
            animate={on ? { opacity: [1, 0.2, 1] } : { opacity: 1 }}
            transition={{ duration: 0.35 / speed, delay: (i * 0.12) / speed }}
          />
        ))}
      </motion.g>
    </svg>
  );
}
