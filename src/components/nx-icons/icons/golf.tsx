"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GolfIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A golf ball that rolls along the green to the flag and drops into the hole at its foot while the flag flutters. */
export function GolfIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GolfIconProps) {
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
        cx="6.8"
        cy="18"
        r="2.2"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { x: [0, 6.6, 8.6, 0, 0, 0], y: [0, 0, 3.2, 0, 0, 0], scale: [1, 1, 0, 0, 1.18, 1] } : { x: 0, y: 0, scale: 1 }}
        transition={{ duration: 1.3 / speed, times: [0, 0.55, 0.65, 0.65, 0.84, 1], ease: ["easeOut", "easeIn", "linear", "easeOut", "easeInOut"] }}
      />
      <path d="M3 21.2H21" />
      <path d="M16.6 2.7V21.2" />
      <motion.path
        d="M16.6 2.7Q13.1 4.2 9.6 5.7Q13.1 7.2 16.6 8.7"
        initial={false}
        animate={on ? { d: ["M16.6 2.7Q13.1 4.2 9.6 5.7Q13.1 7.2 16.6 8.7", "M16.6 2.7Q13.75 2.9 10.5 5.1Q13.75 7.9 16.6 8.7", "M16.6 2.7Q12.55 5.55 8.9 6.4Q12.55 6.55 16.6 8.7", "M16.6 2.7Q13.45 3.43 10.1 5.35Q13.45 7.62 16.6 8.7", "M16.6 2.7Q13.1 4.2 9.6 5.7Q13.1 7.2 16.6 8.7"] } : { d: "M16.6 2.7Q13.1 4.2 9.6 5.7Q13.1 7.2 16.6 8.7" }}
        transition={{ duration: 0.7 / speed, delay: (0.62) / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
