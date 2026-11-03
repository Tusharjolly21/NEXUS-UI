"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type UserCheckIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A person nods hello while a tick draws itself in beside them and settles with a pop. */
export function UserCheckIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: UserCheckIconProps) {
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
        cx="9"
        cy="8"
        r="3.4"
        initial={false}
        animate={on ? { y: [0, 1.2, 0] } : { y: 0 }}
        transition={{ duration: 0.4 / speed, ease: "easeInOut" }}
      />
      <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
      <motion.g
        style={{ originX: "76%", originY: "48%" }}
        initial={false}
        animate={on ? { scale: [0.6, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.5 / speed, delay: (on ? 0.2 : 0) / speed, times: [0, 0.7, 1], ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M15.4 11.3l2.1 2.1 3.5-4"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: [0, 1], opacity: [0, 1, 1] } : { pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 0.4 / speed, delay: (on ? 0.1 : 0) / speed, ease: "easeOut" },
            opacity: { duration: 0.4 / speed, delay: (on ? 0.1 : 0) / speed, times: [0, 0.1, 1] },
          }}
        />
      </motion.g>
    </svg>
  );
}
