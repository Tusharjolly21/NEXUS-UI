"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type EyeIconProps = {
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

/** An eye that blinks, then glances left and right before looking straight ahead. */
export function EyeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: EyeIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleY: [1, 0.08, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.3 / speed, times: [0, 0.45, 1], ease: "easeInOut" }}
      >
        <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" />
        <motion.g
          initial={false}
          animate={on ? { x: [0, 0, -2.4, 2.4, 0] } : { x: 0 }}
          transition={{ duration: 1.1 / speed, times: [0, 0.3, 0.5, 0.75, 1], ease: "easeInOut" }}
        >
          <circle cx="12" cy="12" r="3.4" />
          <circle cx="12" cy="12" r="1.5" fill={accent} stroke="none" />
        </motion.g>
      </motion.g>
    </svg>
  );
}
