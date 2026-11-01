"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BugIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff3b30. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A beetle that scuttles in place, its legs and antennae wiggling in turn. */
export function BugIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BugIconProps) {
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
        d="M10 7.8 8.2 4.8"
        stroke={accent}
        style={{ originX: "100%", originY: "100%" }}
        initial={false}
        animate={on ? { rotate: [0, -14, 10, -8, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6 / speed }}
      />
      <motion.path
        d="M14 7.8l1.8-3"
        stroke={accent}
        style={{ originX: "0%", originY: "100%" }}
        initial={false}
        animate={on ? { rotate: [0, 14, -10, 8, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6 / speed }}
      />
      <motion.g
        initial={false}
        animate={on ? { y: [0, -0.8, 0, -0.8, 0] } : { y: 0 }}
        transition={{ duration: 0.6 / speed, ease: "easeInOut" }}
      >
        <path d="M12 10.5v7" stroke={accent} />
        <path d="M12 7.5c-2.6 0-4.5 2-4.5 5v1.5c0 3 1.8 5.5 4.5 5.5s4.5-2.5 4.5-5.5v-1.5c0-3-1.9-5-4.5-5z" />
        <motion.g
          style={{ originX: "100%", originY: "50%" }}
          initial={false}
          animate={on ? { scaleX: [1, 0.55, 1, 0.55, 1] } : { scaleX: 1 }}
          transition={{ duration: 0.6 / speed }}
        >
          <path d="M7.5 11.5H4M7.5 15H4M8.2 18.5l-2.7 2" />
        </motion.g>
        <motion.g
          style={{ originX: "0%", originY: "50%" }}
          initial={false}
          animate={on ? { scaleX: [1, 0.55, 1, 0.55, 1] } : { scaleX: 1 }}
          transition={{ duration: 0.6 / speed, delay: (0.15) / speed }}
        >
          <path d="M16.5 11.5H20M16.5 15H20M15.8 18.5l2.7 2" />
        </motion.g>
      </motion.g>
    </svg>
  );
}
