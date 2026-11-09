"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FireTruckIconProps = {
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

/** A fire truck whose ladder swings up from the roof and slides out a rung longer, then folds back down. */
export function FireTruckIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FireTruckIconProps) {
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
      <rect x="2.8" y="9.7" width="10.6" height="4.6" rx="1.4" />
      <rect x="13.4" y="7.7" width="7.8" height="6.6" rx="2" />
      <rect x="15.4" y="9.5" width="4.2" height="2.4" rx="0.6" fill="currentColor" stroke="none" />
      <circle cx="7" cy="16.5" r="2.2" />
      <circle cx="17" cy="16.5" r="2.2" />
      <path d="M6.2 9.7V7.9M11.2 9.7V7.9" strokeWidth={strokeWidth * 0.6} />
      <motion.g
        style={{ originX: "19.17%", originY: "26.67%" }}
        initial={false}
        animate={on ? { rotate: [0, -14, -14, -14, 0] } : { rotate: 0 }}
        transition={{ duration: 1.2 / speed, times: [0, 0.25, 0.6, 0.72, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M4.6 4.9H12.6M4.6 7.9H12.6"
          stroke={accent}
          strokeWidth={strokeWidth * 0.6}
          initial={false}
          animate={on ? { d: ["M4.6 4.9H12.6M4.6 7.9H12.6", "M4.6 4.9H12.6M4.6 7.9H12.6", "M4.6 4.9H15.27M4.6 7.9H15.27", "M4.6 4.9H15.27M4.6 7.9H15.27", "M4.6 4.9H12.6M4.6 7.9H12.6"] } : { d: "M4.6 4.9H12.6M4.6 7.9H12.6" }}
          transition={{ duration: 1.2 / speed, times: [0, 0.25, 0.6, 0.72, 1], ease: "easeInOut" }}
        />
        <path d="M7.27 4.9V7.9M9.93 4.9V7.9M12.6 4.9V7.9" stroke={accent} strokeWidth={strokeWidth * 0.6} />
        <motion.path
          d="M12.6 4.9V7.9"
          stroke={accent}
          strokeWidth={strokeWidth * 0.6}
          initial={false}
          animate={on ? { x: [0, 0, 2.67, 2.67, 0], opacity: [0, 0, 1, 1, 0] } : { x: 0, opacity: 0 }}
          transition={{ duration: 1.2 / speed, times: [0, 0.25, 0.6, 0.72, 1], ease: "easeInOut" }}
        />
      </motion.g>
    </svg>
  );
}
