"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BasketballIconProps = {
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

/** A basketball that drops to the floor, squashes flat on impact and rebounds twice, its seams staying attached. */
export function BasketballIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BasketballIconProps) {
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
      <path d="M5 21.3H19" />
      <motion.g
        initial={false}
        animate={on ? { y: [0, 2.6, -0.9, 2.6, 0] } : { y: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.26, 0.56, 0.76, 1], ease: ["easeIn", "easeOut", "easeIn", "easeOut"] }}
      >
        <motion.g
          style={{ originX: "50%", originY: "69.58%" }}
          initial={false}
          animate={on ? { scaleX: [1, 0.96, 1.14, 0.97, 1.02, 0.98, 1.07, 1, 1], scaleY: [1, 1.05, 0.78, 1.04, 1.02, 1.03, 0.9, 1, 1] } : { scaleX: 1, scaleY: 1 }}
          transition={{ duration: 1 / speed, times: [0, 0.21, 0.26, 0.34, 0.54, 0.72, 0.76, 0.85, 1], ease: "easeOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12 2.7V16.7M5 9.7H19M7.32 4.5A8.07 8.07 0 0 1 7.32 14.9M16.68 4.5A8.07 8.07 0 0 0 16.68 14.9" stroke={accent} strokeWidth={strokeWidth * 0.75} />
          <circle cx="12" cy="9.7" r="7" />
        </motion.g>
      </motion.g>
    </svg>
  );
}
