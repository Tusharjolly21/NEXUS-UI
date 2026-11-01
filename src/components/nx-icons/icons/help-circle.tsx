"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HelpCircleIconProps = {
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

/** A question mark that tilts curiously while its dot hops up and down like a ball. */
export function HelpCircleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HelpCircleIconProps) {
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
      <circle cx="12" cy="12" r="9" />
      <motion.path
        d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.3c-.8.5-1.2 1-1.2 1.9"
        style={{ originX: "50%", originY: "80%" }}
        initial={false}
        animate={on ? { rotate: [0, -9, 7, -3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.7 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M12 17h.01"
        stroke={accent}
        strokeWidth={3}
        initial={false}
        animate={on ? { y: [0, -2.4, 0, -0.9, 0] } : { y: 0 }}
        transition={{ duration: 0.7 / speed, times: [0, 0.35, 0.6, 0.8, 1], ease: "easeOut" }}
      />
    </svg>
  );
}
