"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ShirtIconProps = {
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

/** A t-shirt that swings on its hanger while the star on the chest pops. */
export function ShirtIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ShirtIconProps) {
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
        style={{ originX: "50%", originY: "0%" }}
        initial={false}
        animate={on ? { rotate: [0, -6, 5, -3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <path d="M8.2 3.5 3 6.2l2 4 2.2-1.1v11.4h9.6V9.1l2.2 1.1 2-4-5.2-2.7a4.2 4.2 0 0 1-7.6 0z" />
        <motion.path
          d="M12 11.4l.95 1.9 2.1.3-1.5 1.5.35 2.1L12 16.2l-1.9 1 .35-2.1-1.5-1.5 2.1-.3z"
          fill={accent}
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1.6, 1] } : { scale: 1 }}
          transition={{ duration: 0.35 / speed, delay: (0.35) / speed }}
        />
      </motion.g>
    </svg>
  );
}
