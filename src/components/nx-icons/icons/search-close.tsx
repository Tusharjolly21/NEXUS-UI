"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SearchCloseIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30b0c7. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A magnifier whose ring unwinds into its handle, which stretches into one arm of an X while the second arm is drawn in. */
export function SearchCloseIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SearchCloseIconProps) {
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
      <motion.circle
        cx="10.5"
        cy="10.5"
        r="6.5"
        style={{ originX: "50%", originY: "50%", rotate: 45 }}
        initial={false}
        animate={{ pathLength: on ? 0 : 1, opacity: on ? 0 : 1 }}
        transition={{
          pathLength: { duration: 0.35 / speed, ease: "easeInOut" },
          opacity: { duration: 0.02 / speed, delay: (on ? 0.34 : 0) / speed },
        }}
      />
      <motion.path
        d="M15.1 15.1 20.5 20.5"
        stroke={accent}
        initial={false}
        animate={{ d: on ? "M6.7 6.7 17.3 17.3" : "M15.1 15.1 20.5 20.5" }}
        transition={{ duration: 0.5 / speed, ease: [0.65, 0, 0.35, 1] }}
      />
      <motion.path
        d="M17.3 6.7 6.7 17.3"
        stroke={accent}
        initial={false}
        animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
        transition={{
          pathLength: { duration: 0.3 / speed, delay: (on ? 0.22 : 0) / speed, ease: "easeOut" },
          opacity: { duration: 0.02 / speed, delay: (on ? 0.22 : 0.28) / speed },
        }}
      />
    </svg>
  );
}
