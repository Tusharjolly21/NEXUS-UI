"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type KayakIconProps = {
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

/** A kayak that glides forward as its paddle dips left then right and the waves slide past beneath it. */
export function KayakIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: KayakIconProps) {
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
      <svg x="3" y="0" width="18" height="24" viewBox="3 0 18 24" overflow="hidden">
        <motion.path
          d="M-3 19.4q1.5 -1.4 3 0q1.5 1.4 3 0q1.5 -1.4 3 0q1.5 1.4 3 0q1.5 -1.4 3 0q1.5 1.4 3 0q1.5 -1.4 3 0q1.5 1.4 3 0q1.5 -1.4 3 0q1.5 1.4 3 0q1.5 -1.4 3 0q1.5 1.4 3 0"
          stroke={accent}
          initial={false}
          animate={on ? { x: [0, -12] } : { x: 0 }}
          transition={{ duration: 1.2 / speed, ease: "easeInOut" }}
        />
      </svg>
      <motion.g
        initial={false}
        animate={on ? { x: [0, 1, 0], y: [0, 0.3, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 1.2 / speed, times: [0, 0.5, 1], ease: "easeInOut" }}
      >
        <path d="M3.4 9Q12 11.4 20.6 9C18.4 13.4 15.5 14.2 12 14.2C8.5 14.2 5.6 13.4 3.4 9z" />
        <motion.g
          style={{ originX: "50%", originY: "41.67%" }}
          initial={false}
          animate={on ? { rotate: [0, -16, 0, 16, 0] } : { rotate: 0 }}
          transition={{ duration: 1.2 / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M8.91 13.68L15.09 6.32" />
          <path d="M8.91 13.68L7.5 15.36M15.09 6.32L16.5 4.64" stroke={accent} strokeWidth={strokeWidth * 1.7} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
