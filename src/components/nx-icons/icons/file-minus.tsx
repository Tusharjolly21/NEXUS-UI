"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FileMinusIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff6482. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A document that shudders sideways while a minus sweeps in from the right and springs into place. */
export function FileMinusIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FileMinusIconProps) {
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
        animate={on ? { x: [0, -0.7, 0.5, 0] } : { x: 0 }}
        transition={{ duration: 0.5 / speed, ease: "easeInOut" }}
      >
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
        <motion.path
          d="M9.4 15h5.2"
          stroke={accent}
          initial={false}
          animate={on ? { x: [4, -0.8, 0], opacity: [0, 1, 1], scaleX: [0.4, 1.15, 1] } : { x: 0, opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5 / speed, delay: (on ? 0.12 : 0) / speed, ease: "easeOut" }}
        />
      </motion.g>
    </svg>
  );
}
