"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BirdIconProps = {
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

/** A songbird whose wing flaps twice while its head bobs. */
export function BirdIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BirdIconProps) {
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
      <path d="M16.86 11.02A5.9 5.9 0 0 1 7.65 17.59L4.9 19.24L2.62 14.79L5.44 13.76A5.9 5.9 0 0 1 12.85 7.25" />
      <motion.g
        style={{ originX: "44.5%", originY: "48.9%" }}
        initial={false}
        animate={on ? { rotate: [0, 52, 6, 52, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.22, 0.45, 0.7, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M10.68 11.74Q6.89 11.16 6.28 14.94Q10.07 15.52 10.68 11.74Z" stroke={accent} />
      </motion.g>
      <motion.g
        style={{ originX: "66.6%", originY: "33.1%" }}
        initial={false}
        animate={on ? { rotate: [0, 14, -3, 14, 0], y: [0, 0.8, 0, 0.8, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.22, 0.45, 0.7, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12.85 7.25A3.2 3.2 0 1 1 16.86 11.02" />
        <path d="M19.02 6.95L21.82 8.76L18.63 9.73Z" fill={accent} stroke={accent} strokeWidth={1.2} />
        <circle cx="17.06" cy="7.31" r="0.9" fill="currentColor" stroke="none" />
      </motion.g>
    </svg>
  );
}
