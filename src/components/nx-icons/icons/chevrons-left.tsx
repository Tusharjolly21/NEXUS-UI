"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChevronsLeftIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #66d4cf. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Two chevrons that pull back like a slingshot and fling leftwards in turn, settling with a faint echo. */
export function ChevronsLeftIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ChevronsLeftIconProps) {
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
        d="M17.75 6.5L12.25 12L17.75 17.5"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 0, 0.5, 0] } : { opacity: 0 }}
        transition={{ duration: 0.75 / speed, delay: (0.1) / speed, times: [0, 0.4, 0.62, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M17.75 6.5L12.25 12L17.75 17.5"
        initial={false}
        animate={on ? { x: [0, 2.4, -3, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.75 / speed, delay: (0.1) / speed, times: [0, 0.3, 0.58, 1], ease: ["easeInOut", "easeOut", "easeInOut"] }}
      />
      <motion.path
        d="M11.75 6.5L6.25 12L11.75 17.5"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 0, 0.5, 0] } : { opacity: 0 }}
        transition={{ duration: 0.75 / speed, delay: (0) / speed, times: [0, 0.4, 0.62, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M11.75 6.5L6.25 12L11.75 17.5"
        initial={false}
        animate={on ? { x: [0, 2.4, -3, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.75 / speed, delay: (0) / speed, times: [0, 0.3, 0.58, 1], ease: ["easeInOut", "easeOut", "easeInOut"] }}
      />
    </svg>
  );
}
