"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PlugIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffd60a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A power plug that pulls out of the socket, then pushes back in with a spark. */
export function PlugIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PlugIconProps) {
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
        animate={on ? { y: [0, -3.5, -3.5, 0.5, 0] } : { y: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.35, 0.5, 0.7, 1], ease: "easeInOut" }}
      >
        <path d="M9 2.5v4M15 2.5v4" stroke={accent} />
        <path d="M6.5 6.5h11v5a5.5 5.5 0 0 1-11 0z" />
        <path d="M12 17v4" />
      </motion.g>
      <motion.path
        d="M4.6 3.2l1.6 1.4M19.4 3.2l-1.6 1.4"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 0, 0, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.35, 0.5, 0.7, 1] }}
      />
    </svg>
  );
}
