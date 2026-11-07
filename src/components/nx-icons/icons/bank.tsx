"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BankIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The four columns rise one after another and a coin drops into the doorway between them. */
export function BankIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BankIconProps) {
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
      <path d="M2.5 9 12 3.5 21.5 9z" />
      <motion.path
        d="M5.5 12.5V17.5"
        initial={false}
        animate={on ? { y: [0, -1.1, 0] } : { y: 0 }}
        transition={{ duration: 0.4 / speed, delay: (0) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M9.83 12.5V17.5"
        initial={false}
        animate={on ? { y: [0, -1.1, 0] } : { y: 0 }}
        transition={{ duration: 0.4 / speed, delay: (0.08) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M14.17 12.5V17.5"
        initial={false}
        animate={on ? { y: [0, -1.1, 0] } : { y: 0 }}
        transition={{ duration: 0.4 / speed, delay: (0.16) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M18.5 12.5V17.5"
        initial={false}
        animate={on ? { y: [0, -1.1, 0] } : { y: 0 }}
        transition={{ duration: 0.4 / speed, delay: (0.24) / speed, ease: "easeInOut" }}
      />
      <path d="M2.5 20.5H21.5" />
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.circle
          cx="12"
          cy="11.9"
          r="1.1"
          fill={accent}
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { y: [0, 0, 5.2], scale: [0.4, 1, 1], opacity: [0, 1, 0] } : { opacity: 0 }}
          transition={{ duration: 0.6 / speed, delay: (0.4) / speed, times: [0, 0.2, 1], ease: "easeIn" }}
        />
      </svg>
    </svg>
  );
}
