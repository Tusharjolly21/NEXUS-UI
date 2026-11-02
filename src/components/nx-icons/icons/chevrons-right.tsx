"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChevronsRightIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff9500. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Two chevrons that lean to the right in turn while a wave of colour runs through them. */
export function ChevronsRightIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ChevronsRightIconProps) {
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
        animate={on ? { x: [0, 1.8, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.55 / speed, delay: (0.12) / speed, times: [0, 0.45, 1], ease: ["easeOut", "easeInOut"] }}
      >
        <path d="M6.25 17.5L11.75 12L6.25 6.5" />
        <motion.path
          d="M6.25 17.5L11.75 12L6.25 6.5"
          stroke={accent}
          initial={false}
          animate={on ? { opacity: [0, 1, 0] } : { opacity: 0 }}
          transition={{ duration: 0.55 / speed, delay: (0.12) / speed, times: [0, 0.4, 1], ease: "easeOut" }}
        />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { x: [0, 1.8, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.55 / speed, delay: (0) / speed, times: [0, 0.45, 1], ease: ["easeOut", "easeInOut"] }}
      >
        <path d="M12.25 17.5L17.75 12L12.25 6.5" />
        <motion.path
          d="M12.25 17.5L17.75 12L12.25 6.5"
          stroke={accent}
          initial={false}
          animate={on ? { opacity: [0, 1, 0] } : { opacity: 0 }}
          transition={{ duration: 0.55 / speed, delay: (0) / speed, times: [0, 0.4, 1], ease: "easeOut" }}
        />
      </motion.g>
    </svg>
  );
}
