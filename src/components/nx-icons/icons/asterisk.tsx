"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AsteriskIconProps = {
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

/** The asterisk spins half a turn like a pinwheel, tucking its arms in at speed and popping back out. */
export function AsteriskIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AsteriskIconProps) {
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
        animate={on ? { rotate: [0, 196, 176, 180], scale: [1, 0.8, 1.08, 1] } : { rotate: 0, scale: 1, transition: { duration: 0 / speed } }}
        transition={{ duration: 0.8 / speed, times: [0, 0.55, 0.8, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 18.6L12 5.4" stroke={accent} />
        <path d="M17.72 15.3L6.28 8.7" />
        <path d="M6.28 15.3L17.72 8.7" />
      </motion.g>
    </svg>
  );
}
