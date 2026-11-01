"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BookmarkIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff9f0a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A ribbon that drops in, squashes a little and fills with colour. */
export function BookmarkIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BookmarkIconProps) {
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
        style={{ originX: "50%", originY: "0%" }}
        initial={false}
        animate={on ? { y: [-4, 0.6, 0], scaleY: [1.08, 0.94, 1] } : { y: 0, scaleY: 1 }}
        transition={{ duration: 0.5 / speed, times: [0, 0.65, 1], ease: "easeOut" }}
      >
        <motion.path
          d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
          fill={accent}
          initial={false}
          animate={on ? { fillOpacity: [0, 0, 0.9] } : { fillOpacity: 0 }}
          transition={{ duration: 0.5 / speed, times: [0, 0.5, 1] }}
        />
      </motion.g>
    </svg>
  );
}
