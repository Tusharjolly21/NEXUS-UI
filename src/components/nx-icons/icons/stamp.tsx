"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type StampIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff453a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A rubber stamp that lifts, presses down on the page and leaves a crisp impression line as it comes back up. */
export function StampIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: StampIconProps) {
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
      <motion.path
        d="M5 20.77H19"
        stroke={accent}
        initial={false}
        animate={on ? { strokeWidth: [2, 2, 3.6, 2], scaleX: [1, 1, 1.12, 1] } : { strokeWidth: 2, scaleX: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.5, 0.62, 1], ease: "easeOut" }}
        style={{ originX: "50%", originY: "50%" }}
      />
      <motion.g
        initial={false}
        animate={on ? { y: [0, -2.6, 2.4, 2.4, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.28, 0.52, 0.64, 1], ease: ["easeOut", "easeIn", "linear", "easeInOut"] }}
      >
        <path d="M9.6 12.57C9.6 10.17 9.2 9.17 9.2 7.77V5.97a2.8 2.8 0 0 1 5.6 0V7.77C14.8 9.17 14.4 10.17 14.4 12.57" />
        <rect x="5" y="12.57" width="14" height="4.2" rx="1.4" />
      </motion.g>
    </svg>
  );
}
