"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BitcoinIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #f7931a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The two bars shoot out of the B and drop back in from the top and bottom edges, and the B gives a little squash as they lock. */
export function BitcoinIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BitcoinIconProps) {
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
      <g transform="translate(0.5 0)">

      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1, 1, 0.93, 1.02, 1], scaleX: [1, 1, 1, 1.04, 0.99, 1] } : { scaleY: 1, scaleX: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.62, 0.72, 0.86, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
          <motion.path
            d="M11.1 3V5M14.1 3V5.36"
            stroke={accent}
            initial={false}
            animate={on ? { y: [0, -8, -8, 0, 0] } : { y: 0 }}
            transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.4, 0.66, 1], ease: ["easeIn", "linear", "easeIn", "linear"] }}
          />
          <motion.path
            d="M11.1 19V21M14.1 18.91V21"
            stroke={accent}
            initial={false}
            animate={on ? { y: [0, 8, 8, 0, 0] } : { y: 0 }}
            transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.4, 0.66, 1], ease: ["easeIn", "linear", "easeIn", "linear"] }}
          />
        </svg>
        <path d="M6.3 5H12.57A3.42 3.42 0 0 1 12.57 11.85" />
        <path d="M8.3 11.85H13.32A3.58 3.58 0 0 1 13.32 19H6.3" />
        <path d="M8.3 5V19" />
      </motion.g>
      </g>
    </svg>
  );
}
