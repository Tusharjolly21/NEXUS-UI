"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type QuoteIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ac8e68. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Two quotation marks that pop in one after the other, each ring swelling as its tail swings down. */
export function QuoteIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: QuoteIconProps) {
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
        cx="7"
        cy="9.5"
        r="3"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [0, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.4 / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M10 9.5C10 13.5 8.2 16 5 17.5"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.35 / speed, delay: (on ? 0.15 : 0) / speed, ease: "easeOut" }}
      />
      <motion.circle
        cx="17"
        cy="9.5"
        r="3"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [0, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.4 / speed, delay: (on ? 0.2 : 0) / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M20 9.5C20 13.5 18.2 16 15 17.5"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.35 / speed, delay: (on ? 0.35 : 0) / speed, ease: "easeOut" }}
      />
    </svg>
  );
}
