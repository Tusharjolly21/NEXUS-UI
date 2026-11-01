"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FlameIconProps = {
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

/** A flame that flickers and sways, with a bright core pulsing inside. */
export function FlameIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FlameIconProps) {
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
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.1, 0.95, 1.06, 1], scaleX: [1, 0.94, 1.04, 0.97, 1], skewX: [0, -4, 3, -2, 0] } : { scaleY: 1, scaleX: 1, skewX: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <path d="M12 21.2c-3.8 0-6.4-2.6-6.4-6.2 0-2.8 1.6-4.5 3.1-6.2 1.1-1.3 1.9-2.7 2.1-4.7 3.7 1.8 7.6 6.4 7.6 11 0 3.6-2.7 6.1-6.4 6.1z" />
        <motion.path
          d="M12 20.5a2.2 2.2 0 0 1-2.2-2.2c0-1.2 1-1.9 2.2-3.3 1.2 1.4 2.2 2.1 2.2 3.3a2.2 2.2 0 0 1-2.2 2.2z"
          fill={accent}
          stroke={accent}
          initial={false}
          animate={on ? { opacity: [0.4, 1, 0.5, 1, 0.6] } : { opacity: 0.6 }}
          transition={{ duration: 0.8 / speed }}
        />
      </motion.g>
    </svg>
  );
}
