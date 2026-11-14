"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HandPointingIconProps = {
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

/** A hand with the index finger raised taps down once while two accent click ripples spread from the fingertip. */
export function HandPointingIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HandPointingIconProps) {
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
      <g transform="translate(0.25 0)">
        <motion.path
          d="M3.13 3.65A4.15 4.15 0 0 1 9.67 3.65"
          stroke={accent}
          strokeWidth={1.5}
          initial={false}
          animate={on ? { d: ["M3.13 3.65A4.15 4.15 0 0 1 9.67 3.65", "M3.13 3.65A4.15 4.15 0 0 1 9.67 3.65", "M2.46 3.12A5 5 0 0 1 10.34 3.12"], opacity: [0, 0.95, 0] } : { d: "M3.13 3.65A4.15 4.15 0 0 1 9.67 3.65", opacity: 0 }}
          transition={{ duration: 0.5 / speed, delay: (0.25) / speed, times: [0, 0.01, 1], ease: "easeOut" }}
        />
        <motion.path
          d="M3.33 3.8A3.9 3.9 0 0 1 9.47 3.8"
          stroke={accent}
          strokeWidth={1.2}
          initial={false}
          animate={on ? { d: ["M3.33 3.8A3.9 3.9 0 0 1 9.47 3.8", "M3.33 3.8A3.9 3.9 0 0 1 9.47 3.8", "M2.85 3.43A4.5 4.5 0 0 1 9.95 3.43"], opacity: [0, 0.8, 0] } : { d: "M3.33 3.8A3.9 3.9 0 0 1 9.47 3.8", opacity: 0 }}
          transition={{ duration: 0.42 / speed, delay: (0.36) / speed, times: [0, 0.01, 1], ease: "easeOut" }}
        />
        <motion.g
          initial={false}
          animate={on ? { y: [0, 0.9, 0] } : { y: 0 }}
          transition={{ duration: 0.5 / speed, ease: "easeInOut" }}
        >
          <path d="M12.4 10.88L12.4 12.88M16.4 10.88L16.4 12.88M8.4 10.88L8.4 12.59" strokeWidth={strokeWidth * 0.75} />
          <path d="M4.4 12.5L7.8 12.5A2 2 0 0 1 7.8 16.5L4.4 16.5" />
          <path d="M4.4 12.5L4.4 6.2A2 2 0 0 1 8.4 6.2L8.4 10.88A2.2 2.2 0 0 1 12.4 10.88A2.2 2.2 0 0 1 16.4 10.88A2.2 2.2 0 0 1 20.6 11.8L20.6 14.0C20.6 16.0 17.8 15.6 17.8 17.4L17.8 18.2A1.6 1.6 0 0 1 16.2 19.8L7.6 19.8A1.6 1.6 0 0 1 6 18.2L4.4 16.5C2.4 16.5 2.4 12.5 4.4 12.5Z" />
        </motion.g>
      </g>
    </svg>
  );
}
