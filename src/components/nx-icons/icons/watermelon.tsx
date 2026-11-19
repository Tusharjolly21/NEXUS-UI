"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WatermelonIconProps = {
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

/** A watermelon slice rocks on its round rind like a little boat and settles back level. */
export function WatermelonIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WatermelonIconProps) {
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
      <g transform="translate(0 -0.12)">

      <motion.g
        style={{ originX: "50%", originY: "30.83%" }}
        initial={false}
        animate={on ? { rotate: [0, 8, -6, 3.5, -1.5, 0], x: [0, 1.33, -0.99, 0.58, -0.25, 0] } : { rotate: 0, x: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.2, 0.42, 0.62, 0.82, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M18.6 7.4A6.6 6.6 0 0 1 5.4 7.4Z" fill={accent} stroke="none" />
        <ellipse cx="14.31" cy="10.16" rx="0.8" ry="1.2" transform="rotate(-40 14.31 10.16)" fill="currentColor" stroke="none" />
        <ellipse cx="12" cy="11" rx="0.8" ry="1.2" transform="rotate(0 12 11)" fill="currentColor" stroke="none" />
        <ellipse cx="9.69" cy="10.16" rx="0.8" ry="1.2" transform="rotate(40 9.69 10.16)" fill="currentColor" stroke="none" />
        <path d="M18.6 7.4A6.6 6.6 0 0 1 5.4 7.4" />
        <path d="M2.5 7.4H21.5A9.5 9.5 0 0 1 2.5 7.4Z" />
      </motion.g>

      </g>
    </svg>
  );
}
