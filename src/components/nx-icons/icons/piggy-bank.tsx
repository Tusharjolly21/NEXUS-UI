"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PiggyBankIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff6482. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A coin drops into a piggy bank, which squashes under its weight and wobbles. */
export function PiggyBankIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PiggyBankIconProps) {
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
      <motion.circle
        cx="11.7"
        cy="3"
        r="1.6"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { y: [0, 6.6, 6.6], opacity: [1, 1, 0] } : { y: 0, opacity: 0 }}
        transition={{ duration: 0.4 / speed, times: [0, 0.85, 1], ease: "easeIn" }}
      />
      <motion.g
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1, 0.93, 1.04, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.5, 0.65, 0.82, 1], ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M8 18.4v2.6M15 18.4v2.6" />
        <path d="M10.2 9.8h3" stroke={accent} />
        <ellipse cx="11.5" cy="13.2" rx="7.6" ry="5.4" />
        <path d="M8.6 8.6 8.1 5.4l3.3 2.1" />
        <path d="M19 11.4h1.4a1 1 0 0 1 1 1v1.8a1 1 0 0 1-1 1H19" />
        <path d="M16.2 11.6h.01" strokeWidth={2.4} />
        <path d="M4 11.6c-1.2-.2-1.8-1-1.4-2" />
      </motion.g>
    </svg>
  );
}
