"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BookIconProps = {
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

/** An open book whose right-hand page turns over. */
export function BookIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BookIconProps) {
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
      <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5z" />
      <path d="M12 6.5v13" />
      <motion.path
        d="M12 6.5C14 5 17 4.5 20.5 5v13c-3.5-.5-6.5 0-8.5 1.5z"
        stroke={accent}
        style={{ originX: "0%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleX: [1, 0.15, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.7 / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
