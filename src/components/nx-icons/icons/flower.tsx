"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FlowerIconProps = {
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

/** A flower whose five round petals turn and bloom open round a pulsing centre, with its leaf lifting on the stem. */
export function FlowerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FlowerIconProps) {
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
      <path d="M12 12.89V21" />
      <motion.path
        d="M12 19.6c.35-1.75 1.75-2.65 3.6-2.65-.3 1.75-1.65 2.65-3.6 2.65z"
        stroke={accent}
        strokeWidth={1.6}
        style={{ originX: "0%", originY: "100%" }}
        initial={false}
        animate={on ? { rotate: [0, -14, 4, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 72], scale: [1, 1.08, 1] } : { rotate: 0, scale: 1 }}
        transition={on ? { duration: 0.8 / speed, ease: "easeInOut" } : { duration: 0 / speed }}
      >
        <rect x="5.95" y="3.15" width="12.1" height="12.1" fill="none" stroke="none" />
        <path d="M9.83 6.21A2.3 2.3 0 1 1 14.17 6.21A2.3 2.3 0 1 1 15.51 10.34A2.3 2.3 0 1 1 12 12.89A2.3 2.3 0 1 1 8.49 10.34A2.3 2.3 0 1 1 9.83 6.21Z" />
      </motion.g>
      <motion.circle
        cx="12"
        cy="9.2"
        r="1.7"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.45, 1, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.8 / speed }}
      />
    </svg>
  );
}
