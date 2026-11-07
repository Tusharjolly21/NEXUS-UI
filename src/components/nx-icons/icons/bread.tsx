"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BreadIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ac8e68. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A scored loaf that puffs up as if baking while three wisps of steam rise off it. */
export function BreadIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BreadIconProps) {
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
        style={{ originX: "50%", originY: "73%" }}
        initial={false}
        animate={on ? { scaleX: [1, 1.04, 1.02, 1.04, 1], scaleY: [1, 1.09, 1.04, 1.08, 1] } : { scaleX: 1, scaleY: 1 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M6 17.5a3 3 0 0 1-3-3C3 9.5 6.8 6.5 12 6.5s9 3 9 8a3 3 0 0 1-3 3z" />
        <motion.path
          d="M6.5 14.1 9.1 10.7M10.7 14.1l2.6-3.4M14.9 14.1l2.6-3.4"
          stroke={accent}
          initial={false}
          animate={on ? { strokeWidth: [2, 2.8, 2.4, 2.8, 2] } : { strokeWidth: 2 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
        />
      </motion.g>
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        {([[8.8, 0], [12, 0.18], [15.2, 0.36]] as [number, number][]).map(([x, d]) => (
          <motion.path
            key={x}
            d={`M${x} 3.4c-1.3-1 1.3-2 0-3`}
            stroke={accent}
            strokeWidth={1.6}
            initial={false}
            animate={on ? { y: [2.4, -1.2], opacity: [0, 1, 1, 0] } : { y: 0, opacity: 0 }}
            transition={{ duration: 0.7 / speed, delay: (0.15 + d) / speed, ease: "easeOut" }}
          />
        ))}
      </svg>
    </svg>
  );
}
