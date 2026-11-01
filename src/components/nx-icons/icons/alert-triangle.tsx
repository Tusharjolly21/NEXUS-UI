"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AlertTriangleIconProps = {
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

/** A warning triangle that shakes and flashes amber, twice, to get your attention. */
export function AlertTriangleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AlertTriangleIconProps) {
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
        style={{ originX: "50%", originY: "92%" }}
        initial={false}
        animate={on ? { rotate: [0, -9, 9, -6, 6, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <motion.path
          d="M12 3.2 2.6 19.4a1.2 1.2 0 0 0 1 1.8h16.8a1.2 1.2 0 0 0 1-1.8z"
          fill={accent}
          initial={false}
          animate={on ? { fillOpacity: [0, 0.3, 0, 0.3, 0] } : { fillOpacity: 0 }}
          transition={{ duration: 0.8 / speed }}
        />
        <path d="M12 9.5v4.4" stroke={accent} />
        <path d="M12 17.2h.01" stroke={accent} strokeWidth={2.6} />
      </motion.g>
    </svg>
  );
}
