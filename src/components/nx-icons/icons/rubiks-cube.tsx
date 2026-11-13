"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RubiksCubeIconProps = {
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

/** The cube turns a third of a revolution, squeezing slightly, and lands on an identical face. */
export function RubiksCubeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RubiksCubeIconProps) {
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
        animate={on ? { rotate: [0, 120], scale: [1, 0.9, 1] } : { rotate: 0, scale: 1 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M9.29 7.3L12 5.73L14.71 7.3L12 8.87z" fill={accent} stroke="none" />
        <path d="M6.57 12L9.29 13.57L9.29 16.7L6.57 15.13z" fill={accent} stroke="none" />
        <path d="M14.71 13.57L17.43 12L17.43 15.13L14.71 16.7z" fill={accent} stroke="none" />
        <path d="M6.57 5.73L14.71 10.43M6.57 8.87L14.71 4.17M9.29 4.17L17.43 8.87M9.29 10.43L17.43 5.73M6.57 8.87L6.57 18.27M3.86 10.43L12 15.13M9.29 10.43L9.29 19.83M3.86 13.57L12 18.27M14.71 10.43L14.71 19.83M12 15.13L20.14 10.43M17.43 8.87L17.43 18.27M12 18.27L20.14 13.57" strokeWidth={strokeWidth * 0.4} />
        <path d="M12 2.6L20.14 7.3L20.14 16.7L12 21.4L3.86 16.7L3.86 7.3z" />
        <path d="M3.86 7.3L12 12L20.14 7.3M12 12L12 21.4" />
      </motion.g>
    </svg>
  );
}
