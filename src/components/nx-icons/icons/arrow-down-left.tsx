"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ArrowDownLeftIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An arrow that shoots off to the lower left and comes back head first, its shaft drawing in behind it while a glint runs along the line. */
export function ArrowDownLeftIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ArrowDownLeftIconProps) {
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
        d="M5.5 18.5L18.5 5.5"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0.28, 0.28], pathOffset: [0, 0.72], opacity: [0, 1, 0] } : { pathLength: 0.28, pathOffset: 0, opacity: 0 }}
        transition={{ duration: 0.34 / speed, delay: (0.6) / speed, ease: "easeInOut" }}
      />
      <motion.g
        initial={false}
        animate={on ? { x: [0, -9, 9, 0], y: [0, 9, -9, 0], opacity: [1, 0, 0, 1] } : { x: 0, y: 0, opacity: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.4, 0.41, 0.8], ease: ["easeIn", "linear", "easeOut"] }}
      >
        <motion.path
          d="M5.5 18.5L18.5 5.5"
          initial={false}
          animate={on ? { pathLength: [1, 1, 0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.41, 0.42, 0.9], ease: "easeOut" }}
        />
        <path d="M12.5 18.5L5.5 18.5L5.5 11.5" />
      </motion.g>
    </svg>
  );
}
