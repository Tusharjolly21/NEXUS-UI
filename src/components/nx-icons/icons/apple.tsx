"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AppleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff3b30. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An apple that drops in, bounces three times and wiggles its leaf. */
export function AppleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AppleIconProps) {
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
        animate={on ? { y: [-3, 0, -1.6, 0, -0.6, 0], scaleY: [1, 0.9, 1.03, 0.95, 1.01, 1] } : { y: 0, scaleY: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.28, 0.5, 0.7, 0.85, 1], ease: "easeOut" }}
      >
        <path d="M8.9 11.6c.1-1 .6-1.7 1.4-2.1" stroke={accent} />
        <path d="M12 8.4C10.6 7 8.2 6.6 6.6 8c-2 1.8-1.8 5.2-.2 8 1.2 2.2 2.7 4.2 4.1 4.2.6 0 1-.4 1.5-.4s.9.4 1.5.4c1.4 0 2.9-2 4.1-4.2 1.6-2.8 1.8-6.2-.2-8-1.6-1.4-4-1-5.4.4z" />
        <path d="M12 8C12 5.8 12.7 4.2 13.8 3.2" />
        <motion.path
          d="M14.2 4.4C15 2.8 17 2.4 18.6 3 18.2 4.6 16.4 5.4 14.2 4.4z"
          stroke={accent}
          style={{ originX: "0%", originY: "100%" }}
          initial={false}
          animate={on ? { rotate: [0, 14, -8, 4, 0] } : { rotate: 0 }}
          transition={{ duration: 0.9 / speed, delay: (0.25) / speed }}
        />
      </motion.g>
    </svg>
  );
}
