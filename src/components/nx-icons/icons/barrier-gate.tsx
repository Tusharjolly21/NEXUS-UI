"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BarrierGateIconProps = {
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

/** A striped boom barrier that lifts, holds, and lowers back across the road. */
export function BarrierGateIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BarrierGateIconProps) {
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
      <rect x="3.5" y="4.5" width="5" height="15" />
      <motion.g
        style={{ originX: "35.42%", originY: "41.67%" }}
        initial={false}
        animate={on ? { rotate: [0, -38, -38, -6, 0] } : { rotate: 0 }}
        transition={{ duration: 1.1 / speed, ease: "easeInOut", times: [0, 0.38, 0.58, 0.88, 1] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <rect x="9.5" y="9" width="2" height="2" fill={accent} stroke="none" /><rect x="13.5" y="9" width="2" height="2" fill={accent} stroke="none" /><rect x="17.5" y="9" width="2" height="2" fill={accent} stroke="none" />
        <rect x="8.5" y="8" width="12" height="4" />
      </motion.g>
    </svg>
  );
}
