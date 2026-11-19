"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BabyIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff6b8a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The baby's head rocks side to side in a giggle while its curl springs and its rosy cheeks glow. */
export function BabyIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BabyIconProps) {
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
        style={{ originX: "50%", originY: "87.5%" }}
        initial={false}
        animate={on ? { rotate: [0, -7, 6, -3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.22, 0.5, 0.76, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.circle
          cx="7.4" cy="15" r="0.85" fill={accent} stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1.45, 1, 1.35, 1] } : { scale: 1 }}
          transition={{ duration: 0.85 / speed, times: [0, 0.22, 0.5, 0.76, 1], ease: "easeInOut" }}
        />
        <motion.circle
          cx="16.6" cy="15" r="0.85" fill={accent} stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1.45, 1, 1.35, 1] } : { scale: 1 }}
          transition={{ duration: 0.85 / speed, times: [0, 0.22, 0.5, 0.76, 1], ease: "easeInOut" }}
        />
        <circle cx="12" cy="13.6" r="7.4" />
        <motion.path
          d="M12 6.2L12 4.5A1.5 1.5 0 0 1 14.65 3.54"
          style={{ originX: "0%", originY: "100%" }}
          initial={false}
          animate={on ? { rotate: [0, -16, 12, -6, 0] } : { rotate: 0 }}
          transition={{ duration: 0.85 / speed, times: [0, 0.22, 0.5, 0.76, 1], ease: "easeInOut" }}
        />
        <circle cx="9.1" cy="12.6" r="1" fill="currentColor" stroke="none" />
        <circle cx="14.9" cy="12.6" r="1" fill="currentColor" stroke="none" />
        <path d="M10.1 15.6A2.1 2.1 0 0 0 13.9 15.6" />
      </motion.g>
    </svg>
  );
}
