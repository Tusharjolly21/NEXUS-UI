"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BandageIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff453a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An adhesive bandage that presses onto the skin, squashing slightly while its four pad dots pulse in turn. */
export function BandageIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BandageIconProps) {
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
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { scale: [1, 0.88, 1.05, 1], rotate: [0, -4, 2, 0] } : { scale: 1, rotate: 0 }} transition={{ duration: 0.6 / speed, times: [0, 0.3, 0.65, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M4.22 14.12L14.12 4.22A4 4 0 0 1 19.78 9.88L9.88 19.78A4 4 0 0 1 4.22 14.12Z"  />
      <path d="M6.63 11.72L12.28 17.37"  />
      <path d="M11.72 6.63L17.37 12.28"  />
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { scale: [1, 1.12, 1] } : { scale: 1 }} transition={{ duration: 0.3 / speed, ease: "easeInOut", delay: (0.3) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <circle cx="10.16" cy="12" r="0.95" fill={accent} stroke="none" />
      <circle cx="12" cy="13.84" r="0.95" fill={accent} stroke="none" />
      <circle cx="12" cy="10.16" r="0.95" fill={accent} stroke="none" />
      <circle cx="13.84" cy="12" r="0.95" fill={accent} stroke="none" />
      </motion.g>
      </motion.g>
    </svg>
  );
}
