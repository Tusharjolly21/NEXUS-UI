"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ScrollDownIconProps = {
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

/** A mouse whose wheel rolls down and fades, a fresh wheel dropping in from the top while the chevron below follows it. */
export function ScrollDownIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ScrollDownIconProps) {
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
      <rect x="7.5" y="2.5" width="9" height="12.5" rx="4.5" />
      <motion.path
        d="M12 6v2.2"
        stroke={accent}
        initial={false}
        animate={on ? { y: [0, 3, -2, 0], opacity: [1, 0, 0, 1] } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.4, 0.5, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M9 18.2l3 2.8 3-2.8"
        stroke={accent}
        initial={false}
        animate={on ? { y: [0, 2.2, -2.2, 0], opacity: [1, 0, 0, 1] } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.9 / speed, delay: (0.1) / speed, times: [0, 0.4, 0.5, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
