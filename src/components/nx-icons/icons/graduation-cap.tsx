"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GraduationCapIconProps = {
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

/** A mortarboard tossed in the air, its tassel swinging. */
export function GraduationCapIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GraduationCapIconProps) {
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
        style={{ originX: "50%", originY: "60%" }}
        initial={false}
        animate={on ? { y: [0, -3, 0], rotate: [0, -8, 0] } : { y: 0, rotate: 0 }}
        transition={{ duration: 0.7 / speed, times: [0, 0.45, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M2 9.5 12 5l10 4.5-10 4.5z" />
        <path d="M6.5 11.8v4.2c0 1.3 2.5 2.7 5.5 2.7s5.5-1.4 5.5-2.7v-4.2" />
        <motion.path
          d="M22 9.5v5"
          stroke={accent}
          style={{ originX: "100%", originY: "0%" }}
          initial={false}
          animate={on ? { rotate: [0, 14, -10, 6, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
        />
      </motion.g>
    </svg>
  );
}
