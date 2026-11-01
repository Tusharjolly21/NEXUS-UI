"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BalloonIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A balloon that bobs up on its string, sways and bounces back. */
export function BalloonIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BalloonIconProps) {
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
        style={{ originX: "50%", originY: "88%" }}
        initial={false}
        animate={on ? { y: [0, -3, 0, -1.4, 0], rotate: [0, -4, 4, -2, 0] } : { y: 0, rotate: 0 }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M12 17.5c-1.6 1.2 1.6 2.4 0 3.6"
          stroke={accent}
          initial={false}
          animate={on ? { x: [0, 0.6, -0.6, 0.4, 0] } : { x: 0 }}
          transition={{ duration: 1 / speed }}
        />
        <path d="M8.8 8.2c.2-1.4 1-2.2 2-2.6" stroke={accent} />
        <path d="M12 2.8c-3.6 0-6 2.7-6 6.2 0 3.7 2.6 6.4 6 6.9 3.4-.5 6-3.2 6-6.9 0-3.5-2.4-6.2-6-6.2z" />
        <path d="M12 15.9l-1 1.6h2z" />
      </motion.g>
    </svg>
  );
}
