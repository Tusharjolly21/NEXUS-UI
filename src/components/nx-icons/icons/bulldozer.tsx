"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BulldozerIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffd60a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A bulldozer that lowers its blade, shoves forward and pushes up a little pile of earth. */
export function BulldozerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BulldozerIconProps) {
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
        initial={false}
        animate={on ? { x: [0, 0, 0.8, 0] } : { x: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.3, 0.7, 1], ease: "easeInOut" }}
      >
        <motion.g
          style={{ originX: "55.21%", originY: "44.79%" }}
          initial={false}
          animate={on ? { rotate: [0, 9, 9, 0] } : { rotate: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.3, 0.7, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M13.25 10.75H20.54M19.25 7.95Q22.45 12.95 19.25 17.95" stroke={accent} />
        </motion.g>
        <path d="M6.25 13.25V6.55a1.2 1.2 0 0 1 1.2-1.2H9.95a1.2 1.2 0 0 1 1.2 1.2V9.55H13.25V13.25" />
        <rect x="3.15" y="13.25" width="12.8" height="5.4" rx="2.7" />
        <path d="M6.15 15.95h.01 M9.55 15.95h.01 M12.95 15.95h.01" strokeWidth={1.8} />
      </motion.g>
      <motion.path
        d="M22.85 19.25h.01M23.55 19.25h.01M23.2 18.15h.01"
        strokeWidth={1.3}
        style={{ originX: "96.88%", originY: "82.71%" }}
        initial={false}
        animate={on ? { scale: [0.2, 0.2, 1, 1, 0.2], opacity: [0, 1, 1, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.3, 0.7, 0.85, 1] }}
      />
    </svg>
  );
}
