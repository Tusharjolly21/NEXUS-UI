"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChefHatIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A chef's toque that squats, hops and lands while its puffy crown swells and settles. */
export function ChefHatIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ChefHatIconProps) {
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
        style={{ originX: "50%", originY: "86.083%" }}
        initial={false}
        animate={on ? { scaleY: [1, 0.94, 1.03, 0.97, 1], scaleX: [1, 1.04, 0.985, 1.02, 1], y: [0, 0, -0.6, 0, 0] } : { scaleY: 1, scaleX: 1, y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.2, 0.5, 0.8, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M10.755 16.46L10.443 10.46 M13.245 16.46L13.557 10.46" stroke={accent} strokeWidth={strokeWidth * 0.75} />
        <path d="M6.2 17.66 A1.2 1.2 0 0 1 7.4 16.46 L16.6 16.46 A1.2 1.2 0 0 1 17.8 17.66 L17.8 19.46 A1.2 1.2 0 0 1 16.6 20.66 L7.4 20.66 A1.2 1.2 0 0 1 6.2 19.46 Z" />
        <path d="M8 16.46L7 10.46" />
        <path d="M16 16.46L17 10.46" />
        <motion.g
          style={{ originX: "50%", originY: "43.583%" }}
          initial={false}
          animate={on ? { scaleY: [1, 1, 1.07, 0.98, 1] } : { scaleY: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.55, 0.8, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M7 10.46 A3 3 0 1 1 9.065 5.284 A3.2 3.2 0 0 1 14.935 5.284 A3 3 0 1 1 17 10.46 Z" />
        </motion.g>
      </motion.g>
    </svg>
  );
}
