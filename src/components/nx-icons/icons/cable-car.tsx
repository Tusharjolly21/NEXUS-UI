"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CableCarIconProps = {
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

/** A cable car that glides off along its cable and glides back in, then swings gently as it stops. */
export function CableCarIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CableCarIconProps) {
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
      <path d="M2.5 6 21.5 4" />
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.g
          initial={false}
          animate={on ? { x: [0, 14, -14, 0], y: [0, -1.5, 1.5, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.4, 0.401, 1], ease: "easeInOut" }}
        >
          <motion.g
            style={{ originX: "50%", originY: "21%" }}
            initial={false}
            animate={on ? { rotate: [0, 0, 0, 7, -5, 3, -1, 0] } : { rotate: 0 }}
            transition={{ duration: 1.5 / speed, times: [0, 0.2, 0.4, 0.55, 0.68, 0.79, 0.9, 1], ease: "easeInOut" }}
          >
            <rect width="24" height="24" fill="none" stroke="none" />
            <path d="M12 5V8.5" />
            <circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none" />
            <rect x="6.5" y="8.5" width="11" height="11.5" rx="2.5" />
            <path d="M10 12V15.5M14 12V15.5" stroke={accent} />
          </motion.g>
        </motion.g>
      </svg>
    </svg>
  );
}
