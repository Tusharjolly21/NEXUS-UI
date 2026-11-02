"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ArrowDownCircleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff6482. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A ring that floods with colour from the centre while the arrow inside drops out and bounces back in from above. */
export function ArrowDownCircleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ArrowDownCircleIconProps) {
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
        cx="12"
        cy="12"
        r="9"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [0, 1, 1], opacity: [0.3, 0.3, 0] } : { opacity: 0 }}
        transition={{ duration: 0.6 / speed, times: [0, 0.5, 1], ease: "easeOut" }}
      />
      <circle cx="12" cy="12" r="9" />
      <motion.g
        initial={false}
        animate={on ? { y: [0, 6, -6, 1.4, 0], opacity: [1, 0, 0, 1] } : { x: 0, y: 0, opacity: 1 }}
        transition={{
          y: { duration: 0.95 / speed, delay: (0.1) / speed, times: [0, 0.34, 0.35, 0.68, 0.88], ease: ["easeIn", "linear", "easeOut", "easeInOut"] },
          opacity: { duration: 0.95 / speed, delay: (0.1) / speed, times: [0, 0.24, 0.6, 0.76], ease: "linear" },
        }}
      >
        <path d="M12 7L12 17" />
        <path d="M16.5 12.5L12 17L7.5 12.5" />
      </motion.g>
    </svg>
  );
}
