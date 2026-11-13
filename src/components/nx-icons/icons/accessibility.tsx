"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AccessibilityIconProps = {
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

/** A figure inside a ring does a star jump, arms sweeping up and legs closing as it hops, then lands back. */
export function AccessibilityIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AccessibilityIconProps) {
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
      <circle cx="12" cy="12" r="9.5"  />
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { y: [0, -0.4, 0] } : { y: 0 }} transition={{ duration: 0.8 / speed, times: [0, 0.5, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <motion.path d="M7 9.6L12 10.8L17 9.6" stroke={accent} initial={false} animate={on ? { d: ["M7 9.6L12 10.8L17 9.6", "M6.8 7.4L12 10.8L17.2 7.4", "M7 9.6L12 10.8L17 9.6"] } : { d: "M7 9.6L12 10.8L17 9.6" }} transition={{ duration: 0.8 / speed, times: [0, 0.5, 1], ease: "easeInOut" }} />
      <motion.path d="M9.2 18L12 14.6L14.8 18" stroke={accent} initial={false} animate={on ? { d: ["M9.2 18L12 14.6L14.8 18", "M10.6 18.6L12 14.6L13.4 18.6", "M9.2 18L12 14.6L14.8 18"] } : { d: "M9.2 18L12 14.6L14.8 18" }} transition={{ duration: 0.8 / speed, times: [0, 0.5, 1], ease: "easeInOut" }} />
      <path d="M12 10.8L12 14.6" stroke={accent} />
      <circle cx="12" cy="6.6" r="2" fill={accent} stroke="none" />
      </motion.g>
    </svg>
  );
}
