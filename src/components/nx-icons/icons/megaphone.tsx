"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MegaphoneIconProps = {
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

/** A megaphone that blares twice, with sound lines flashing out of it. */
export function MegaphoneIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MegaphoneIconProps) {
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
      <g transform="translate(1.5 -0.75)">
      <motion.g
        style={{ originX: "20%", originY: "60%" }}
        initial={false}
        animate={on ? { rotate: [0, -8, 3, -6, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3.4 10.4 17.4 6v12L3.4 13.6z" />
        <path d="M10.8 16.4a2.8 2.8 0 1 1-5.4-1" />
      </motion.g>
      <motion.path
        d="M20.6 9.5l1.6-.6M20.6 14.5l1.6.6"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 1, 0, 1, 0], x: [-1, 0.6, -1, 0.6, 0] } : { opacity: 0 }}
        transition={{ duration: 0.6 / speed }}
      />
      </g>
    </svg>
  );
}
