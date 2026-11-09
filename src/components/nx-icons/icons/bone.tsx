"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BoneIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ac8e68. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The bone wobbles side to side and a small sparkle flashes at its corner. */
export function BoneIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BoneIconProps) {
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
        animate={on ? { rotate: [0, -9, 7, -4, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g transform="translate(0 0) rotate(-45 12 12)">
          <path d="M9.86 10.1L14.14 10.1A3.4 3.4 0 1 1 18.43 12A3.4 3.4 0 1 1 14.14 13.9L9.86 13.9A3.4 3.4 0 1 1 5.57 12A3.4 3.4 0 1 1 9.86 10.1z" />
        </g>
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [0, 1.2, 0.9, 0], rotate: [0, 45, 90, 135], opacity: [0, 1, 1, 0] } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.7 / speed, delay: (on ? 0.25 : 0) / speed, ease: "easeOut" }}
      >
        <path d="M4.6 2.2V6.2M2.6 4.2H6.6" stroke={accent} strokeWidth={strokeWidth * 0.75} />
      </motion.g>
    </svg>
  );
}
