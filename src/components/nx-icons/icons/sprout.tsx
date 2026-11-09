"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SproutIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A seedling that pushes up through the soil as its stem rises and its two leaves unfurl. */
export function SproutIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SproutIconProps) {
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
        style={{ originX: "50%", originY: "82.96%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.2, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.35 / speed, times: [0, 0.4, 1], ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M4.6 19.91A7.4 3.8 0 0 1 19.4 19.91Z" />
      </motion.g>
      <motion.path
        d="M12 16.11L12 9.41"
        initial={false}
        animate={on ? { pathLength: [0, 0, 1], opacity: [0, 0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5 / speed, ease: "easeOut", pathLength: { times: [0, 0.1, 1] }, opacity: { times: [0, 0.1, 0.12, 1], ease: "linear" } }}
      />
      <motion.g
        style={{ originX: "50%", originY: "39.21%" }}
        initial={false}
        animate={on ? { scale: [0, 0, 1.12, 1], rotate: [50, 50, -5, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.95 / speed, times: [0, 0.42, 0.78, 1], ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 9.41C11.55 5.6 7.89 3.31 3.86 4.32C4.72 8.38 8.38 10.67 12 9.41Z" stroke={accent} />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "39.21%" }}
        initial={false}
        animate={on ? { scale: [0, 0, 1.12, 1], rotate: [-50, -50, 5, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.95 / speed, times: [0, 0.5, 0.84, 1], ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 9.41C15.62 10.67 19.28 8.38 20.14 4.32C16.11 3.31 12.45 5.6 12 9.41Z" stroke={accent} />
      </motion.g>
    </svg>
  );
}
