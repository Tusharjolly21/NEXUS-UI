"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PlaneIconProps = {
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

/** An airliner that takes off up and to the right, then glides back in. */
export function PlaneIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PlaneIconProps) {
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
      <g transform="rotate(45 12 12)">
        <motion.g
          initial={false}
          animate={on ? { y: [0, -10, 10, 0], opacity: [1, 0, 0, 1] } : { y: 0, opacity: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.4, 0.41, 0.85], ease: "easeInOut" }}
        >
          <path d="M12 2.5c.9 0 1.5.9 1.5 2V9l7.5 4.5V16l-7.5-2.2V19l2.2 1.5V22L12 21l-3.7 1V20.5L10.5 19v-5.2L3 16v-2.5L10.5 9V4.5c0-1.1.6-2 1.5-2z" stroke={accent} />
        </motion.g>
      </g>
    </svg>
  );
}
