"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WarehouseIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A warehouse whose roller door rattles up into its frame, pauses, and rolls back down. */
export function WarehouseIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WarehouseIconProps) {
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
      <path d="M3 21V8.5L12 3l9 5.5V21Z" />
      <path d="M12 7.6h.01" strokeWidth={2.4} />
      <svg x="6.5" y="13" width="11" height="7" viewBox="6.5 13 11 7" overflow="hidden">
        <motion.path
          d="M6.5 15.08 h11"
          stroke={accent}
          strokeWidth={strokeWidth * 0.75}
          strokeLinecap="butt"
          initial={false}
          animate={on ? { y: [0, -6.4, -6.4, 0] } : { y: 0 }}
          transition={{ duration: 1 / speed, delay: (0) / speed, times: [0, 0.4, 0.6, 1], ease: "easeInOut" }}
        />
        <motion.path
          d="M6.5 17.92 h11"
          stroke={accent}
          strokeWidth={strokeWidth * 0.75}
          strokeLinecap="butt"
          initial={false}
          animate={on ? { y: [0, -6.4, -6.4, 0] } : { y: 0 }}
          transition={{ duration: 1 / speed, delay: (0.07) / speed, times: [0, 0.4, 0.6, 1], ease: "easeInOut" }}
        />
      </svg>
      <path d="M6.5 21V12h11v9" />
    </svg>
  );
}
