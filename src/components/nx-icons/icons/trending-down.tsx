"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TrendingDownIconProps = {
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

/** A line that slides downhill and redraws itself, the arrowhead thudding in and the whole chart sagging a touch. */
export function TrendingDownIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TrendingDownIconProps) {
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
        initial={false}
        animate={on ? { y: [0, 0, 1.2, -0.3, 0] } : { y: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.6, 0.78, 0.9, 1], ease: "easeInOut" }}
      >
        <motion.path
          d="M2.6 7.2l6 6 4.2-4.2 8.2 8.2"
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.6 / speed, ease: "easeIn" }}
        />
        <motion.path
          d="M15.8 17.2H21V12"
          stroke={accent}
          style={{ originX: "100%", originY: "100%" }}
          initial={false}
          animate={on ? { scale: [0, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.35 / speed, delay: (on ? 0.5 : 0) / speed }}
        />
      </motion.g>
    </svg>
  );
}
