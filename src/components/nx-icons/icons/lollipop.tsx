"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LollipopIconProps = {
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

/** A lollipop whose spiral spins round while the stick tilts from side to side. */
export function LollipopIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LollipopIconProps) {
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
        style={{ originX: "50%", originY: "89.58%" }}
        initial={false}
        animate={on ? { rotate: [0, -9, 7, -4, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="12" cy="9.5" r="7" />
        <path d="M12 16.5V21.5" />
        <motion.g
          style={{ originX: "50%", originY: "39.58%" }}
          initial={false}
          animate={on ? { rotate: 360 } : { rotate: 0, transition: { duration: 0 / speed } }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12 8.3L12.14 8.22L12.3 8.16L12.48 8.13L12.66 8.11L12.86 8.12L13.06 8.16L13.26 8.22L13.46 8.32L13.65 8.44L13.84 8.59L14.01 8.77L14.16 8.98L14.29 9.21L14.39 9.47L14.46 9.74L14.5 10.03L14.51 10.33L14.48 10.64L14.41 10.96L14.3 11.27L14.15 11.57L13.96 11.86L13.74 12.13L13.47 12.39L13.17 12.61L12.84 12.81L12.48 12.96L12.09 13.08L11.69 13.15L11.27 13.18L10.84 13.15L10.41 13.08L9.97 12.96L9.55 12.78L9.15 12.55L8.76 12.27L8.4 11.94L8.08 11.56L7.8 11.15L7.56 10.69M12 10.7L11.86 10.78L11.7 10.84L11.52 10.87L11.34 10.89L11.14 10.88L10.94 10.84L10.74 10.78L10.54 10.68L10.35 10.56L10.16 10.41L9.99 10.23L9.84 10.02L9.71 9.79L9.61 9.53L9.54 9.26L9.5 8.97L9.49 8.67L9.52 8.36L9.59 8.04L9.7 7.73L9.85 7.43L10.04 7.14L10.26 6.87L10.53 6.61L10.83 6.39L11.16 6.19L11.52 6.04L11.91 5.92L12.31 5.85L12.73 5.82L13.16 5.85L13.59 5.92L14.03 6.04L14.45 6.22L14.85 6.45L15.24 6.73L15.6 7.06L15.92 7.44L16.2 7.85L16.44 8.31" stroke={accent} strokeWidth={strokeWidth * 0.75} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
