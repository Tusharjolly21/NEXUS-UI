"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type DoorbellIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The round button presses in and two rings of sound ripple out on both sides: ding, dong. */
export function DoorbellIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: DoorbellIconProps) {
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
        d="M4.94 18.36A8 8 0 0 1 4.94 10.84M19.06 10.84A8 8 0 0 1 19.06 18.36"
        style={{ originX: "50%", originY: "50%" }}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { opacity: [0, 1, 0], scale: [0.86, 1, 1.06] } : { opacity: 0, scale: 0.86 }}
        transition={{ duration: 0.45 / speed, delay: (0.12) / speed, times: [0, 0.3, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M3.35 19.2A9.8 9.8 0 0 1 3.35 10M20.65 10A9.8 9.8 0 0 1 20.65 19.2"
        style={{ originX: "50%", originY: "50%" }}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { opacity: [0, 1, 0], scale: [0.86, 1, 1.06] } : { opacity: 0, scale: 0.86 }}
        transition={{ duration: 0.45 / speed, delay: (0.42) / speed, times: [0, 0.3, 1], ease: "easeOut" }}
      />
      <motion.circle
        cx="12"
        cy="14.6"
        r="2.6"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 0.78, 1, 1] } : { scale: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.12, 0.3, 1], ease: "easeInOut" }}
      />
      <path d="M7.6 6A3.2 3.2 0 0 1 10.8 2.8L13.2 2.8A3.2 3.2 0 0 1 16.4 6L16.4 18A3.2 3.2 0 0 1 13.2 21.2L10.8 21.2A3.2 3.2 0 0 1 7.6 18Z" />
      <circle cx="12" cy="7.4" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  );
}
