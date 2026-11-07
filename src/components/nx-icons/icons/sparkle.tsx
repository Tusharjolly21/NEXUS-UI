"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SparkleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A large four pointed star and two small ones that twinkle in turn, scaling and turning a little before settling. */
export function SparkleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SparkleIconProps) {
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
        style={{ originX: "41.67%", originY: "58.33%" }}
        initial={false}
        animate={on ? { scale: [1, 1.16, 0.94, 1], rotate: [0, 14, -6, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M10 6.5Q11.12 12.88 17.5 14Q11.12 15.12 10 21.5Q8.88 15.12 2.5 14Q8.88 12.88 10 6.5z" fill={accent} fillOpacity={0.2} />
      </motion.g>
      <motion.g
        style={{ originX: "77.5%", originY: "22.5%" }}
        initial={false}
        animate={on ? { scale: [1, 1.45, 0.8, 1], rotate: [0, 45, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.6 / speed, delay: (0.18) / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M18.6 2.3Q19.07 4.94 21.7 5.4Q19.07 5.87 18.6 8.5Q18.14 5.87 15.5 5.4Q18.14 4.94 18.6 2.3z" fill={accent} stroke={accent} strokeWidth={1.5} />
      </motion.g>
      <motion.g
        style={{ originX: "80.42%", originY: "80%" }}
        initial={false}
        animate={on ? { scale: [1, 1.5, 0.8, 1], rotate: [0, -45, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.6 / speed, delay: (0.34) / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M19.3 16.8Q19.66 18.84 21.7 19.2Q19.66 19.56 19.3 21.6Q18.94 19.56 16.9 19.2Q18.94 18.84 19.3 16.8z" fill={accent} stroke={accent} strokeWidth={1.5} />
      </motion.g>
    </svg>
  );
}
