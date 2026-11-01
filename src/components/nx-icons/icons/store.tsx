"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type StoreIconProps = {
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

/** A shop front whose striped awning rolls down and whose door swings open. */
export function StoreIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: StoreIconProps) {
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
        style={{ originX: "50%", originY: "0%" }}
        initial={false}
        animate={on ? { scaleY: [0.3, 1.12, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.45 / speed, times: [0, 0.7, 1], ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M9.4 4 8.4 9M14.6 4l1 5" stroke={accent} />
        <path d="M3.5 9 5.3 4h13.4l1.8 5H3.5" />
        <path d="M3.5 9a2.83 2.83 0 0 0 5.67 0 2.83 2.83 0 0 0 5.66 0 2.83 2.83 0 0 0 5.67 0" />
      </motion.g>
      <path d="M5 12v8h14v-8" />
      <motion.path
        d="M9.6 20v-5.2h4.8V20"
        style={{ originX: "0%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleX: [1, 1, 0.2, 0.2, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.4, 0.55, 0.8, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
