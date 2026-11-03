"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type NavigationIconProps = {
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

/** A location arrow that swings away, whips round past its heading and settles, the shaded half lighting up as it locks on. */
export function NavigationIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: NavigationIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, -75, 28, -10, 0], scale: [1, 0.92, 1.06, 1, 1] } : { rotate: 0, scale: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.35, 0.65, 0.85, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M19.5 4.5 13.2 19.5l-2-6.7z"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { fillOpacity: [0.3, 0.3, 0.3, 0.9, 0.3] } : { fillOpacity: 0.3 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.35, 0.65, 0.8, 1] }}
        />
        <path d="M19.5 4.5 4.5 10.8l6.7 2 2 6.7z" />
      </motion.g>
    </svg>
  );
}
