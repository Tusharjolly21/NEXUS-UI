"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ExternalLinkIconProps = {
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

/** An arrow that hops out of its window towards the corner and comes back. */
export function ExternalLinkIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ExternalLinkIconProps) {
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
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <motion.g
        initial={false}
        animate={on ? { x: [0, 1.8, 0], y: [0, -1.8, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.5 / speed, ease: "easeInOut" }}
      >
        <path d="M15 3h6v6" stroke={accent} />
        <path d="M10 14 21 3" stroke={accent} />
      </motion.g>
    </svg>
  );
}
