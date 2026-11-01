"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LinkIconProps = {
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

/** Two halves of a chain that pull apart and click back together with a spark. */
export function LinkIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LinkIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
        initial={false}
        animate={on ? { x: [0, -2.4, 0], y: [0, 2.4, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.6 / speed, times: [0, 0.5, 1], ease: ["easeOut", "easeIn"] }}
      >
        <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.1 1.1" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { x: [0, 2.4, 0], y: [0, -2.4, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.6 / speed, times: [0, 0.5, 1], ease: ["easeOut", "easeIn"] }}
      >
        <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.1-1.1" stroke={accent} />
      </motion.g>
      <motion.path
        d="M12 1.8v1.6M20.6 4.4l-1.1 1.1M3.4 19.6l1.1-1.1M22 12h-1.6"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 0, 1, 0], scale: [0.6, 0.6, 1.1, 1] } : { opacity: 0 }}
        transition={{ duration: 0.6 / speed, times: [0, 0.45, 0.6, 1] }}
      />
    </svg>
  );
}
