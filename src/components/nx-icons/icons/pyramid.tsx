"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PyramidIconProps = {
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

/** A pyramid that rises a touch as the hatching of its shaded side is drawn in and the desert sun pulses. */
export function PyramidIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PyramidIconProps) {
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
<g transform="translate(0 -0.33)">
      <motion.g
        style={{ originX: "50%", originY: "88.33%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.05, 0.98, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.7 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M11 3.5L2.5 16.5L12.4 21.2L21.5 16Z" />
        <path d="M11 3.5L12.4 21.2" />
        <motion.path
          d="M11.59 10.93 L15.41 8.75"
          strokeWidth={strokeWidth * 0.75}
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.3 / speed, delay: (on ? 0.1 : 0) / speed, ease: "easeOut" }}
        />
        <motion.path
          d="M11.87 14.47 L17.51 11.25"
          strokeWidth={strokeWidth * 0.75}
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.3 / speed, delay: (on ? 0.25 : 0) / speed, ease: "easeOut" }}
        />
        <motion.path
          d="M12.15 18.01 L19.61 13.75"
          strokeWidth={strokeWidth * 0.75}
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.3 / speed, delay: (on ? 0.4 : 0) / speed, ease: "easeOut" }}
        />
      </motion.g>
      <motion.circle
        cx="19.2"
        cy="5.2"
        r="1.7"
        stroke={accent}
        initial={false}
        animate={on ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.7 / speed, ease: "easeInOut" }}
      />
</g>
    </svg>
  );
}
