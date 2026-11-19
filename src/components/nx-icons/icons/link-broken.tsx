"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LinkBrokenIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff453a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The two halves of the link jolt apart and shudder back while the sparks at the break crackle outwards. */
export function LinkBrokenIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LinkBrokenIconProps) {
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
        d="M15.68 15.68L16.81 16.81M8.32 8.32L7.19 7.19"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 0.5, 1.3, 0.9, 1], opacity: [1, 0.3, 1, 1, 1] } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.7 / speed, times: [0, 0.18, 0.42, 0.7, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M11.33 7.93L13.17 6.1A3.35 3.35 0 0 1 17.9 10.83L16.07 12.67"
        initial={false}
        animate={on ? { x: [0, 0.92, -0.25, 0.28, 0], y: [0, -0.92, 0.25, -0.28, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.7 / speed, times: [0, 0.2, 0.48, 0.72, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M12.67 16.07L10.83 17.9A3.35 3.35 0 0 1 6.1 13.17L7.93 11.33"
        initial={false}
        animate={on ? { x: [0, -0.92, 0.25, -0.28, 0], y: [0, 0.92, -0.25, 0.28, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.7 / speed, times: [0, 0.2, 0.48, 0.72, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
