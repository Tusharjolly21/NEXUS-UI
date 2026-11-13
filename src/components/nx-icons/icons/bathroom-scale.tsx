"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BathroomScaleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The needle of a bathroom scale falls to zero, swings past the mark and wobbles to a stop. */
export function BathroomScaleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BathroomScaleIconProps) {
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
      <motion.g style={{ originX: "50%", originY: "52.08%" }} initial={false} animate={on ? { rotate: [0, -30, 100, -12, 22, -5, 0] } : { rotate: 0 }} transition={{ duration: 1 / speed, times: [0, 0.14, 0.36, 0.54, 0.7, 0.85, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M12 12.5L9.88 9.97" strokeWidth={strokeWidth * 0.75} stroke={accent} />
      </motion.g>
      <motion.g style={{ originX: "50%", originY: "85.42%" }} initial={false} animate={on ? { scaleY: [1, 0.96, 1] } : { scaleY: 1 }} transition={{ duration: 0.3 / speed, ease: "easeInOut", delay: (0.05) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M8 3.5H16A4.5 4.5 0 0 1 20.5 8V16A4.5 4.5 0 0 1 16 20.5H8A4.5 4.5 0 0 1 3.5 16V8A4.5 4.5 0 0 1 8 3.5Z"  />
      <path d="M6.2 12.5A5.8 5.8 0 0 1 17.8 12.5Z"  />
      <path d="M7.6 17L10.6 17"  /><path d="M13.4 17L16.4 17"  />
      </motion.g>
    </svg>
  );
}
