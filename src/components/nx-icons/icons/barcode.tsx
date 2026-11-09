"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BarcodeIconProps = {
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

/** A scan line that sweeps up and down over the bars before the four corners snap in. */
export function BarcodeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BarcodeIconProps) {
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
        animate={on ? { scale: [1, 1, 0.92, 1] } : { scale: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.78, 0.88, 1] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M2.5 7.5v-3a2 2 0 0 1 2-2h3M16.5 2.5h3a2 2 0 0 1 2 2v3M21.5 16.5v3a2 2 0 0 1-2 2h-3M7.5 21.5h-3a2 2 0 0 1-2-2v-3" />
      </motion.g>
      <rect x="4.5" y="6.5" width="3" height="11" fill="currentColor" stroke="none" />
      <rect x="8.62" y="6.5" width="1.5" height="11" fill="currentColor" stroke="none" />
      <rect x="11.25" y="6.5" width="1.5" height="11" fill="currentColor" stroke="none" />
      <rect x="13.88" y="6.5" width="3" height="11" fill="currentColor" stroke="none" />
      <rect x="18" y="6.5" width="1.5" height="11" fill="currentColor" stroke="none" />
      <motion.path
        d="M3.5 12h17"
        stroke={accent}
        strokeWidth={1.6}
        initial={false}
        animate={on ? { y: [0, -5.5, 5.5, 0] } : { y: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.22, 0.74, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
