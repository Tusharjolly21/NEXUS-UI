"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AnchorIconProps = {
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

/** An anchor that plunges, swings on its chain and settles. */
export function AnchorIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AnchorIconProps) {
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
        style={{ originX: "50%", originY: "8%" }}
        initial={false}
        animate={on ? { rotate: [0, -12, 10, -6, 3, 0] } : { rotate: 0 }}
        transition={{ duration: 1.1 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="12" cy="5" r="2" stroke={accent} />
        <path d="M12 7v14M8.5 10h7M4 14c0 4 3.6 7 8 7s8-3 8-7" />
      </motion.g>
    </svg>
  );
}
