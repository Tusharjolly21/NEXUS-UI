"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HandbagIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A tote bag that swings from its handles while the clasp glints. */
export function HandbagIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HandbagIconProps) {
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
        style={{ originX: "50%", originY: "16.96%" }}
        initial={false}
        animate={on ? { rotate: [0, 7, -5, 3, -1, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.22, 0.46, 0.68, 0.86, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M5.8 10.27 V7.07 a3.8 3.8 0 0 1 7.6 0 V10.27" />
        <path d="M10.6 10.27 V7.07 a3.8 3.8 0 0 1 7.6 0 V10.27" />
        <path d="M5.3 10.27 L18.7 10.27 A0.8 0.8 0 0 1 19.49 10.96 L20.46 18.18 A2.2 2.2 0 0 1 18.28 20.67 L5.72 20.67 A2.2 2.2 0 0 1 3.54 18.18 L4.51 10.96 A0.8 0.8 0 0 1 5.3 10.27z" />
        <path d="M10.6 14.67 H13.4" stroke={accent} />
        <motion.path
          d="M16.5 12.57 l.7 1.4 1.4 .7 -1.4 .7 -.7 1.4 -.7 -1.4 -1.4 -.7 1.4 -.7z"
          fill={accent}
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [0, 0.95, 0], rotate: [0, 45, 90] } : { scale: 0, rotate: 0 }}
          transition={{ duration: 0.45 / speed, delay: (0.5) / speed }}
        />
      </motion.g>
    </svg>
  );
}
