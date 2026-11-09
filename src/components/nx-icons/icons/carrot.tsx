"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CarrotIconProps = {
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

/** A carrot that twirls a little while its leaf tufts wave one after another. */
export function CarrotIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CarrotIconProps) {
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
        style={{ originX: "34.64%", originY: "65.24%" }}
        initial={false}
        animate={on ? { rotate: [0, 11, -8, 4, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3.01 20.96L15.51 13.53A3.7 3.7 0 1 0 10.44 8.46z" />
        <path d="M10.4 16.57L8.99 15.15M9.04 10.82L10.45 12.23" />
        <motion.g
          style={{ originX: "59.68%", originY: "28.01%" }}
          initial={false}
          animate={on ? { rotate: [0, -14, 10, 6, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 / speed, delay: (0.22) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M14.32 6.72Q14.19 4.76 15.05 2.99" stroke={accent} />
        </motion.g>
        <motion.g
          style={{ originX: "67.64%", originY: "32.24%" }}
          initial={false}
          animate={on ? { rotate: [0, -14, 10, 6, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 / speed, delay: (0.1) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M16.23 7.74Q18.21 6.46 19.49 4.48" stroke={accent} />
        </motion.g>
        <motion.g
          style={{ originX: "71.87%", originY: "40.2%" }}
          initial={false}
          animate={on ? { rotate: [0, 14, -10, 6, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 / speed, delay: (0.34) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M17.25 9.65Q19.21 9.78 20.98 8.92" stroke={accent} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
