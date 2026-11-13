"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ShredderIconProps = {
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

/** A sheet is swallowed by the shredder, which shudders while red strips drop into its bin, then a fresh sheet slides in. */
export function ShredderIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ShredderIconProps) {
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
        d="M9 12.5V15.4"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { pathLength: [0.05, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.45 / speed, delay: (on ? 0.45 : 0) / speed, ease: "easeOut", opacity: { duration: 0.01 / speed, delay: (on ? 0.45 : 0) / speed } }}
      />
      <motion.path
        d="M12 12.5V16.4"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { pathLength: [0.05, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.45 / speed, delay: (on ? 0.54 : 0) / speed, ease: "easeOut", opacity: { duration: 0.01 / speed, delay: (on ? 0.54 : 0) / speed } }}
      />
      <motion.path
        d="M15 12.5V15.8"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { pathLength: [0.05, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.45 / speed, delay: (on ? 0.63 : 0) / speed, ease: "easeOut", opacity: { duration: 0.01 / speed, delay: (on ? 0.63 : 0) / speed } }}
      />
      <svg x="0" y="0" width="24" height="7" viewBox="0 0 24 7" overflow="hidden">
        <motion.path
          d="M7.5 7V2.5H16.5V7"
          initial={false}
          animate={on ? { y: [0, 5, -10, 0] } : { y: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.4, 0.41, 1], ease: ["easeIn", "linear", "easeOut"] }}
        />
      </svg>
      <path d="M6.5 12.5V19.5A2 2 0 0 0 8.5 21.5H15.5A2 2 0 0 0 17.5 19.5V12.5" />
      <path d="M10 19H14" strokeWidth={strokeWidth * 0.75} />
      <motion.g
        initial={false}
        animate={on ? { x: [0, 0.5, -0.5, 0.5, -0.5, 0.4, -0.4, 0] } : { x: 0 }}
        transition={{ duration: 0.8 / speed, delay: (on ? 0.1 : 0) / speed, ease: "linear" }}
      >
        <rect x="3" y="7" width="18" height="5.5" rx="2" />
        <path d="M7.5 9.75H16.5" strokeWidth={strokeWidth * 0.75} />
      </motion.g>
    </svg>
  );
}
