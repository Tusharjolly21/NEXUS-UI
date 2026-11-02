"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TypeIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #00c7be. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A serif capital T that shrinks and swells as its crossbar spreads outward from the middle and the stem draws down. */
export function TypeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TypeIconProps) {
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
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 0.88, 1.07, 1] } : { scale: 1 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.25, 0.65, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M12 5H5v3"
          initial={false}
          animate={on ? { pathLength: [0.3, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.5 / speed, ease: "easeOut" }}
        />
        <motion.path
          d="M12 5h7v3"
          initial={false}
          animate={on ? { pathLength: [0.3, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.5 / speed, ease: "easeOut" }}
        />
        <motion.path
          d="M12 5v14"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: [0.4, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.5 / speed, delay: (on ? 0.1 : 0) / speed, ease: "easeOut" }}
        />
        <motion.path
          d="M12 19H9.5"
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.25 / speed, delay: (on ? 0.4 : 0) / speed, ease: "easeOut" }}
        />
        <motion.path
          d="M12 19h2.5"
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.25 / speed, delay: (on ? 0.4 : 0) / speed, ease: "easeOut" }}
        />
      </motion.g>
    </svg>
  );
}
