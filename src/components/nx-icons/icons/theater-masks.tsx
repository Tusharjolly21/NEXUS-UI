"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TheaterMasksIconProps = {
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

/** Two masks lean together and swap their smile and frown before settling back. */
export function TheaterMasksIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TheaterMasksIconProps) {
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
      <g transform="translate(0 0.23)">
      <g transform="translate(3.1 5.6) rotate(-7 3.8 6.3)">
        <motion.g
          style={{ originX: "3.8px", originY: "12.6px" }}
          initial={false}
          animate={on ? { rotate: [0, -8, -3, -6, 0] } : { rotate: 0 }}
          transition={{ duration: 1 / speed, delay: (0) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M0 1.5Q0 0 1.5 0H6.1Q7.6 0 7.6 1.5V7C7.6 10.4 5.8 12.6 3.8 12.6C1.8 12.6 0 10.4 0 7z" />
          <path d="M2.4 4.4h.01M5.2 4.4h.01" strokeWidth={strokeWidth * 0.8} />
          <motion.path
            d="M2.7 8.5Q3.8 6.3 4.9 8.5"
            stroke={accent}
            strokeWidth={strokeWidth * 0.75}
            initial={false}
            animate={on ? { d: ["M2.7 8.5Q3.8 6.3 4.9 8.5", "M2.7 8.5Q3.8 6.3 4.9 8.5", "M2.7 7.4Q3.8 9.8 4.9 7.4", "M2.7 7.4Q3.8 9.8 4.9 7.4", "M2.7 8.5Q3.8 6.3 4.9 8.5"] } : { d: "M2.7 8.5Q3.8 6.3 4.9 8.5" }}
            transition={{ duration: 1 / speed, delay: (0) / speed, times: [0, 0.15, 0.4, 0.65, 0.9], ease: "easeInOut" }}
          />
        </motion.g>
      </g>
      <g transform="translate(13.3 5.6) rotate(7 3.8 6.3)">
        <motion.g
          style={{ originX: "3.8px", originY: "12.6px" }}
          initial={false}
          animate={on ? { rotate: [0, 8, 3, 6, 0] } : { rotate: 0 }}
          transition={{ duration: 1 / speed, delay: (0.08) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M0 1.5Q0 0 1.5 0H6.1Q7.6 0 7.6 1.5V7C7.6 10.4 5.8 12.6 3.8 12.6C1.8 12.6 0 10.4 0 7z" />
          <path d="M2.4 4.4h.01M5.2 4.4h.01" strokeWidth={strokeWidth * 0.8} />
          <motion.path
            d="M2.7 7.4Q3.8 9.8 4.9 7.4"
            stroke={accent}
            strokeWidth={strokeWidth * 0.75}
            initial={false}
            animate={on ? { d: ["M2.7 7.4Q3.8 9.8 4.9 7.4", "M2.7 7.4Q3.8 9.8 4.9 7.4", "M2.7 8.5Q3.8 6.3 4.9 8.5", "M2.7 8.5Q3.8 6.3 4.9 8.5", "M2.7 7.4Q3.8 9.8 4.9 7.4"] } : { d: "M2.7 7.4Q3.8 9.8 4.9 7.4" }}
            transition={{ duration: 1 / speed, delay: (0.08) / speed, times: [0, 0.15, 0.4, 0.65, 0.9], ease: "easeInOut" }}
          />
        </motion.g>
      </g>
      </g>
    </svg>
  );
}
