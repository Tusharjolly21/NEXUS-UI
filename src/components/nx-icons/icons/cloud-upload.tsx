"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CloudUploadIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An arrow that rises out of a cloud and dissolves into it, then comes back up for the next file. */
export function CloudUploadIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CloudUploadIconProps) {
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
        d="M7 18.2a4.4 4.4 0 0 1-.6-8.7 6 6 0 0 1 11.3 1.6 3.6 3.6 0 0 1-.4 7.1z"
        initial={false}
        animate={on ? { scale: [1, 1, 1.07, 1] } : { scale: 1 }}
        transition={{ duration: 1.2 / speed, times: [0, 0.4, 0.55, 0.8], ease: "easeOut" }}
      />
      <motion.g
        initial={false}
        animate={on ? { y: [0, -7, 6, 0], opacity: [1, 0, 0, 1] } : { y: 0, opacity: 1 }}
        transition={{ duration: 1.2 / speed, times: [0, 0.4, 0.41, 0.9], ease: "easeInOut" }}
      >
        <path d="M12 17v-6.4" stroke={accent} />
        <path d="M9.2 13.2 12 10.4l2.8 2.8" stroke={accent} />
      </motion.g>
    </svg>
  );
}
