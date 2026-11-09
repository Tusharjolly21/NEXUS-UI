"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CraneIconProps = {
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

/** A tower crane whose jib swings round while the hook hoists its load up and sets it down again. */
export function CraneIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CraneIconProps) {
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
      <path d="M6.1 21.4H12.1M9.1 21.4V2.8" />
      <motion.path
        d="M2.7 6.4H21.1"
        initial={false}
        animate={on ? { d: ["M2.7 6.4H21.1", "M2.7 6.4H21.1", "M5.58 6.4H15.7", "M2.7 6.4H21.1"] } : { d: "M2.7 6.4H21.1" }}
        transition={{ duration: 1.1 / speed, times: [0, 0.3, 0.64, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M9.1 2.8L2.7 6.4"
        strokeWidth={strokeWidth * 0.5}
        initial={false}
        animate={on ? { d: ["M9.1 2.8L2.7 6.4", "M9.1 2.8L2.7 6.4", "M9.1 2.8L5.58 6.4", "M9.1 2.8L2.7 6.4"] } : { d: "M9.1 2.8L2.7 6.4" }}
        transition={{ duration: 1.1 / speed, times: [0, 0.3, 0.64, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M9.1 2.8L21.1 6.4"
        strokeWidth={strokeWidth * 0.5}
        initial={false}
        animate={on ? { d: ["M9.1 2.8L21.1 6.4", "M9.1 2.8L21.1 6.4", "M9.1 2.8L15.7 6.4", "M9.1 2.8L21.1 6.4"] } : { d: "M9.1 2.8L21.1 6.4" }}
        transition={{ duration: 1.1 / speed, times: [0, 0.3, 0.64, 1], ease: "easeInOut" }}
      />
      <motion.rect
        x="2.9"
        y="8"
        width="3.2"
        height="3"
        fill="currentColor"
        initial={false}
        animate={on ? { x: [0, 0, 2.88, 0] } : { x: 0 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.3, 0.64, 1], ease: "easeInOut" }}
      />
      <motion.g
        initial={false}
        animate={on ? { x: [0, 0, -3.15, 0] } : { x: 0 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.3, 0.64, 1], ease: "easeInOut" }}
      >
        <motion.path
          d="M16.1 7.4V10.8"
          strokeWidth={strokeWidth * 0.5}
          initial={false}
          animate={on ? { d: ["M16.1 7.4V10.8", "M16.1 7.4V8", "M16.1 7.4V8", "M16.1 7.4V10.8"] } : { d: "M16.1 7.4V10.8" }}
          transition={{ duration: 1.1 / speed, times: [0, 0.3, 0.64, 1], ease: "easeInOut" }}
        />
        <motion.g
          stroke={accent}
          initial={false}
          animate={on ? { y: [0, -2.8, -2.8, 0] } : { y: 0 }}
          transition={{ duration: 1.1 / speed, times: [0, 0.3, 0.64, 1], ease: "easeInOut" }}
        >
          <path d="M16.1 11.8h.01" strokeWidth={2.4} />
          <path d="M16.1 12.8L14.2 15.4M16.1 12.8L18 15.4" strokeWidth={strokeWidth * 0.5} />
          <rect x="13.9" y="15.4" width="4.4" height="3" fill={accent} strokeWidth={1.6} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
