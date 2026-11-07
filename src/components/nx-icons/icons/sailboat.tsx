"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SailBoatIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A sailboat that rocks on the waves while its main sail and jib fill with wind and lean. */
export function SailBoatIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SailBoatIconProps) {
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
        d="M3 20.8q1.5-1.2 3 0t3 0 3 0 3 0 3 0 3 0"
        stroke={accent}
        initial={false}
        animate={on ? { y: [0, -0.6, 0.5, -0.2, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      />
      <motion.g
        style={{ originX: "50%", originY: "80%" }}
        initial={false}
        animate={on ? { rotate: [0, -5, 4, -2.5, 1, 0] } : { rotate: 0 }}
        transition={{ duration: 0.95 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3.5 14.5H20.5L17.6 18H6.4Z" />
        <path d="M12.5 2.8V14.5" />
        <motion.path
          d="M12.5 3 19.2 11.5H12.5"
          stroke={accent}
          style={{ originX: "0%", originY: "100%" }}
          initial={false}
          animate={on ? { scaleX: [1, 1.14, 0.96, 1.06, 1], skewX: [0, -6, 2, -3, 0] } : { scaleX: 1, skewX: 0 }}
          transition={{ duration: 0.95 / speed, ease: "easeInOut" }}
        />
        <motion.path
          d="M9.4 5.6V11.5H4.6Z"
          style={{ originX: "100%", originY: "100%" }}
          initial={false}
          animate={on ? { scaleX: [1, 1.18, 0.95, 1.08, 1], skewX: [0, 6, -2, 3, 0] } : { scaleX: 1, skewX: 0 }}
          transition={{ duration: 0.95 / speed, delay: (0.05) / speed, ease: "easeInOut" }}
        />
      </motion.g>
    </svg>
  );
}
